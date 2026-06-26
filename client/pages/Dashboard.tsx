import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import {
  Clock,
  LogOut,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Menu,
} from "lucide-react";

interface AttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadRecords();

    return () => clearInterval(timer);
  }, [user, navigate]);

  const loadRecords = () => {
    const stored = localStorage.getItem("attendanceRecords");
    const loaded = stored ? JSON.parse(stored) : [];
    setRecords(loaded);

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = loaded.find(
      (r: AttendanceRecord) => r.date === today
    );
    setHasCheckedIn(!!todayRecord?.checkIn);
  };

  const handleCheckIn = () => {
    const today = new Date().toISOString().split("T")[0];
    const existingIndex = records.findIndex((r) => r.date === today);
    const now = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    if (existingIndex !== -1) {
      records[existingIndex].checkIn = now;
    } else {
      records.push({
        date: today,
        checkIn: now,
        checkOut: null,
        totalHours: 0,
      });
    }

    localStorage.setItem("attendanceRecords", JSON.stringify(records));
    setRecords([...records]);
    setHasCheckedIn(true);
  };

  const handleCheckOut = () => {
    const today = new Date().toISOString().split("T")[0];
    const record = records.find((r) => r.date === today);
    if (record && record.checkIn) {
      const now = currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      record.checkOut = now;
      record.totalHours = calculateHours(record.checkIn, now);

      localStorage.setItem("attendanceRecords", JSON.stringify(records));
      setRecords([...records]);
      setHasCheckedIn(false);
    }
  };

  const calculateHours = (checkIn: string, checkOut: string): number => {
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes, seconds] = time.split(":").map(Number);

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return hours * 3600 + minutes * 60 + seconds;
    };

    const checkInSeconds = parseTime(checkIn);
    const checkOutSeconds = parseTime(checkOut);
    const diffSeconds = checkOutSeconds - checkInSeconds;

    return Math.max(0, diffSeconds / 3600);
  };

  const getTodayRecord = () => {
    const today = new Date().toISOString().split("T")[0];
    return records.find((r) => r.date === today);
  };

  const getTotalHours = () => {
    return records.reduce((sum, r) => sum + r.totalHours, 0).toFixed(2);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const today = getTodayRecord();
  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen flex-col md:flex-row">
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col`}
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Absensi Kerja
              </h1>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Signed In As
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {user?.email}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Quick Stats
              </p>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Total Hours
                  </p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {getTotalHours()}h
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Days Attended
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {records.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {theme === "light" ? "Dark" : "Light"} Mode
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex flex-col">
          <div className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Attendance Tracking
            </h2>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex-1 p-4 md:p-6 space-y-6">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Current Time</p>
                  <p className="text-5xl font-bold font-mono">{timeString}</p>
                </div>
                <p className="text-purple-100">{dateString}</p>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                      Check-In
                    </p>
                    {today?.checkIn ? (
                      <>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {today.checkIn}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Checked in
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Not checked in yet
                      </p>
                    )}
                  </div>
                  <CheckCircle2
                    className={`w-6 h-6 ${
                      today?.checkIn
                        ? "text-green-500"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                      Check-Out
                    </p>
                    {today?.checkOut ? (
                      <>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {today.checkOut}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Checked out
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Not checked out yet
                      </p>
                    )}
                  </div>
                  <CheckCircle2
                    className={`w-6 h-6 ${
                      today?.checkOut
                        ? "text-green-500"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {today?.totalHours.toFixed(2) || "0.00"}h
                    </p>
                    {today?.totalHours ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Today
                      </p>
                    ) : null}
                  </div>
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Today's Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasCheckedIn ? "✓ Checked In" : "Check In"}
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!hasCheckedIn || !!today?.checkOut}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {today?.checkOut ? "✓ Checked Out" : "Check Out"}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Daily Report
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {records.length === 0 ? (
                  <Card className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No attendance records yet
                    </p>
                  </Card>
                ) : (
                  records
                    .slice()
                    .reverse()
                    .map((record) => (
                      <Card
                        key={record.date}
                        className="p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {record.checkIn} - {record.checkOut || "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600 dark:text-purple-400">
                              {record.totalHours.toFixed(2)}h
                            </p>
                            {record.totalHours > 0 && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ Complete
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
