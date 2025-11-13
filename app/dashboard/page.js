"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
   const { user } = useAuth();
   const [schedules, setSchedules] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      if (user && user.role === "lecturer") {
         fetchLecturerSchedules();
      }
   }, [user]);

   const fetchLecturerSchedules = async () => {
      try {
         setLoading(true);
         setError("");

         const token = localStorage.getItem("token");
         const response = await fetch(
            `http://localhost:3001/api/schedules/lecturer/${user.id}`,
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            },
         );

         if (response.ok) {
            const data = await response.json();
            setSchedules(data);
         } else {
            const errorData = await response.json();
            setError(errorData.message || "Failed to fetch schedules");
         }
      } catch (err) {
         setError("Network error. Please check your connection and try again.");
         console.error("Error fetching schedules:", err);
      } finally {
         setLoading(false);
      }
   };

   if (!user) {
      return <div>Loading...</div>;
   }

   return (
      <ProtectedRoute>
         <DashboardLayout role={user.role}>
            <div className={styles.dashboard}>
               <h1>Dashboard</h1>
               <div className={styles.welcome}>
                  <h2>
                     Welcome, {user.firstName} {user.lastName}!
                  </h2>
                  <p>Your role: {user.role}</p>
               </div>

               <div className={styles.infoSection}>
                  <p>
                     {user.role === "lecturer"
                        ? 'You can manage your lecture schedules from the "Manage Schedules" section.'
                        : user.role === "super_admin"
                        ? "You can create accounts for lecturers and students."
                        : "You have administrative privileges to manage the entire system."}
                  </p>
                  <p>
                     Students can view all schedules on the{" "}
                     <a href="/">public schedules page</a> without logging in.
                  </p>
               </div>

               {user.role === "lecturer" && (
                  <div className={styles.section}>
                     <h2>Your Schedules</h2>
                     {error && <div className={styles.error}>{error}</div>}
                     {loading ? (
                        <p>Loading your schedules...</p>
                     ) : schedules.length === 0 ? (
                        <p>You haven't created any schedules yet.</p>
                     ) : (
                        <div className={styles.scheduleList}>
                           {schedules.map((schedule) => (
                              <div
                                 key={schedule.id}
                                 className={styles.scheduleCard}
                              >
                                 <h3>
                                    {schedule.courseTitle} (
                                    {schedule.courseCode})
                                 </h3>
                                 <p>
                                    <strong>Date:</strong> {schedule.date}
                                 </p>
                                 <p>
                                    <strong>Time:</strong> {schedule.time}
                                 </p>
                                 <p>
                                    <strong>Venue:</strong> {schedule.venue}
                                 </p>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               <div className={styles.stats}>
                  <div className={styles.statCard}>
                     <h3>Schedules</h3>
                     <p>View and manage lecture schedules</p>
                  </div>

                  {user.role === "super_admin" && (
                     <div className={styles.statCard}>
                        <h3>User Accounts</h3>
                        <p>Create accounts for lecturers and students</p>
                     </div>
                  )}
               </div>
            </div>
         </DashboardLayout>
      </ProtectedRoute>
   );
}
