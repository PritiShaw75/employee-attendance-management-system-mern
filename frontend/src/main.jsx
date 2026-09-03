import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./style.css";

const API = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API
});

function authConfig() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  };
}

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [page, setPage] = useState("dashboard");
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return (
      <Login
        onLogin={(data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }}
      />
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>AttendPro</h2>
        <p>Attendance System</p>

        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("attendance")}>Attendance</button>
        <button onClick={() => setPage("leaves")}>Leaves</button>

        {user.role === "hr" && (
          <>
            <button onClick={() => setPage("hr")}>HR Dashboard</button>
            <button onClick={() => setPage("employees")}>Employees</button>
            <button onClick={() => setPage("deduction")}>Leave Deduction</button>
          </>
        )}

        <button className="logout" onClick={logout}>Logout</button>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{page === "hr" ? "HR Dashboard" : page[0].toUpperCase() + page.slice(1)}</h1>
            <p>Welcome, {user.name}</p>
          </div>
          <span className="role">{user.role}</span>
        </header>

        {message && <div className="message">{message}</div>}

        {page === "dashboard" && <EmployeeDashboard setMessage={setMessage} />}
        {page === "attendance" && <Attendance setMessage={setMessage} />}
        {page === "leaves" && <Leaves setMessage={setMessage} />}
        {page === "hr" && <HRDashboard />}
        {page === "employees" && <Employees />}
        {page === "deduction" && <Deductions />}
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const url = register ? "/auth/register" : "/auth/login";
      const response = await api.post(url, form);

      if (register) {
        setRegister(false);
        setError("Registration successful. Now login.");
      } else {
        onLogin(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>AttendPro</h1>
        <p>Employee Attendance Management System</p>

        <form onSubmit={submit}>
          {register && (
            <input
              placeholder="Full Name"
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <div className="error">{error}</div>}

          <button className="primary">
            {register ? "Register" : "Login"}
          </button>
        </form>

        <button className="link" onClick={() => setRegister(!register)}>
          {register ? "Already have account? Login" : "New employee? Register"}
        </button>
      </div>
    </div>
  );
}

function EmployeeDashboard({ setMessage }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/attendance/my", authConfig()),
      api.get("/leaves/my", authConfig())
    ]).then(([attendance, leaves]) => {
      const records = attendance.data;
      const approvedLeaves = leaves.data.filter(
        (leave) => leave.status === "Approved"
      );

      setData({
        attendanceDays: records.length,
        presentDays: records.filter((x) => x.status === "Present" || x.status === "Completed").length,
        hours: records.reduce((sum, x) => sum + (x.workingHours || 0), 0),
        leaves: approvedLeaves.reduce((sum, x) => sum + x.days, 0)
      });
    });
  }, []);

  return (
    <>
      <div className="cards">
        <Stat title="Attendance Days" value={data?.attendanceDays || 0} />
        <Stat title="Present Days" value={data?.presentDays || 0} />
        <Stat title="Working Hours" value={data?.hours || 0} />
        <Stat title="Approved Leave" value={data?.leaves || 0} />
      </div>

      <div className="box">
        <h3>Today's Attendance</h3>
        <AttendanceButtons setMessage={setMessage} />
      </div>
    </>
  );
}

function AttendanceButtons({ setMessage }) {
  async function action(url) {
    try {
      const response = await api.post(url, {}, authConfig());
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    }
  }

  return (
    <div className="actions">
      <button className="primary" onClick={() => action("/attendance/check-in")}>
        Check In
      </button>
      <button onClick={() => action("/attendance/check-out")}>
        Check Out
      </button>
    </div>
  );
}

function Attendance({ setMessage }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/attendance/my", authConfig()).then((res) => setRecords(res.data));
  }, []);

  return (
    <>
      <div className="box">
        <h3>Mark Attendance</h3>
        <AttendanceButtons setMessage={setMessage} />
      </div>

      <Table
        headers={["Date", "Check In", "Check Out", "Hours", "Status"]}
        rows={records.map((x) => [
          x.date,
          formatDate(x.checkIn),
          formatDate(x.checkOut),
          x.workingHours,
          x.status
        ])}
      />
    </>
  );
}

function Leaves({ setMessage }) {
  const [form, setForm] = useState({});
  const [leaves, setLeaves] = useState([]);

  function loadLeaves() {
    api.get("/leaves/my", authConfig()).then((res) => setLeaves(res.data));
  }

  useEffect(loadLeaves, []);

  async function submit(e) {
    e.preventDefault();

    try {
      const response = await api.post("/leaves", form, authConfig());
      setMessage(response.data.message);
      setForm({});
      loadLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || "Leave request failed");
    }
  }

  return (
    <>
      <div className="box">
        <h3>Request Leave</h3>
        <form className="leave-form" onSubmit={submit}>
          <input
            type="date"
            required
            value={form.startDate || ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="date"
            required
            value={form.endDate || ""}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <input
            placeholder="Reason"
            value={form.reason || ""}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <button className="primary">Submit</button>
        </form>
      </div>

      <Table
        headers={["Start", "End", "Days", "Reason", "Status"]}
        rows={leaves.map((x) => [
          x.startDate,
          x.endDate,
          x.days,
          x.reason,
          x.status
        ])}
      />
    </>
  );
}

function HRDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/hr/dashboard", authConfig()).then((res) => setData(res.data));
  }, []);

  return (
    <div className="cards">
      <Stat title="Employees" value={data?.employees || 0} />
      <Stat title="Present Today" value={data?.presentToday || 0} />
      <Stat title="Working Hours" value={data?.monthlyHours || 0} />
      <Stat title="Approved Leave Days" value={data?.approvedLeaveDays || 0} />
    </div>
  );
}

function Employees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.get("/hr/employees", authConfig()).then((res) => setEmployees(res.data));
  }, []);

  return (
    <Table
      headers={["Name", "Email", "Salary", "Status"]}
      rows={employees.map((x) => [
        x.name,
        x.email,
        x.monthlySalary,
        x.active ? "Active" : "Inactive"
      ])}
    />
  );
}

function Deductions() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/hr/leave-deductions", authConfig()).then((res) => setData(res.data));
  }, []);

  return (
    <Table
      headers={["Employee", "Salary", "Leave Days", "Deduction"]}
      rows={data.map((x) => [
        x.name,
        x.monthlySalary,
        x.leaveDays,
        x.deduction
      ])}
    />
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="box table-box">
      <table>
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length}>No records found</td></tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, i) => <td key={i}>{cell || "—"}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

createRoot(document.getElementById("root")).render(<App />);
