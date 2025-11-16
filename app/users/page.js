"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./users.module.css";

export default function UsersPage() {
   const { user, token } = useAuth();
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [showForm, setShowForm] = useState(false);
   const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "student",
   });

   useEffect(() => {
      if (user) {
         fetchUsers();
      }
   }, [user]);

   const fetchUsers = async () => {
      try {
         // Get fresh token from localStorage in case context is not updated yet
         const currentToken = localStorage.getItem("token");

         if (!currentToken) {
            setError("Authentication required");
            setLoading(false);
            return;
         }

         const response = await fetch("http://localhost:3001/api/users", {
            headers: {
               Authorization: `Bearer ${currentToken}`,
            },
         });

         if (response.ok) {
            const usersData = await response.json();
            setUsers(usersData);
         } else if (response.status === 401) {
            setError("Unauthorized. Please log in again.");
            // Optionally redirect to login
         } else {
            setError("Failed to fetch users");
         }
      } catch (err) {
         console.error("Error fetching users:", err);
         setError("Network error. Please check your connection and try again.");
      } finally {
         setLoading(false);
      }
   };

   const validateForm = () => {
      if (!formData.firstName) {
         setError("First name is required");
         return false;
      }

      if (!formData.lastName) {
         setError("Last name is required");
         return false;
      }

      if (!formData.email) {
         setError("Email is required");
         return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
         setError("Please enter a valid email address");
         return false;
      }

      if (!formData.password) {
         setError("Password is required");
         return false;
      }

      if (formData.password.length < 5) {
         setError("Password must be at least 6 characters long");
         return false;
      }

      return true;
   };

   const handleInputChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });

      // Clear error when user starts typing
      if (error) {
         setError("");
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      try {
         const currentToken = localStorage.getItem("token");

         if (!currentToken) {
            setError("Authentication required");
            return;
         }

         const response = await fetch("http://localhost:3001/api/users", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify(formData),
         });

         if (response.ok) {
            const newUser = await response.json();
            setUsers([...users, newUser]);
            setFormData({
               firstName: "",
               lastName: "",
               email: "",
               phone: "",
               password: "",
               role: "student",
            });
            setShowForm(false);
            // Show success message
            setError("User created successfully!");
            setTimeout(() => setError(""), 3000);
         } else {
            const errorData = await response.json();
            setError(errorData.message || "Failed to create user");
         }
      } catch (err) {
         setError("Network error. Please check your connection and try again.");
         console.error("Error creating user:", err);
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this user?")) {
         return;
      }

      try {
         const currentToken = localStorage.getItem("token");

         if (!currentToken) {
            setError("Authentication required");
            return;
         }

         const response = await fetch(`http://localhost:3001/api/users/${id}`, {
            method: "DELETE",
            headers: {
               Authorization: `Bearer ${currentToken}`,
            },
         });

         if (response.ok) {
            setUsers(users.filter((u) => u.id !== id));
            setError("User deleted successfully!");
            setTimeout(() => setError(""), 3000);
         } else {
            const errorData = await response.json();
            setError(errorData.message || "Failed to delete user");
         }
      } catch (err) {
         setError("Network error. Please check your connection and try again.");
         console.error("Error deleting user:", err);
      }
   };

   if (!user) {
      return <div>Loading...</div>;
   }

   // Only super_admin can access this page
   if (user.role !== "super_admin") {
      return (
         <DashboardLayout role={user.role}>
            <div className={styles.unauthorized}>
               <h2>Access Denied</h2>
               <p>You do not have permission to view this page.</p>
            </div>
         </DashboardLayout>
      );
   }

   return (
      <ProtectedRoute allowedRoles={["super_admin"]}>
         <DashboardLayout role={user.role}>
            <div className={styles.users}>
               <div className={styles.header}>
                  <h1>User Management</h1>
                  <button
                     className={styles.addButton}
                     onClick={() => setShowForm(!showForm)}
                  >
                     {showForm ? "Cancel" : "Add User"}
                  </button>
               </div>

               {error && <div className={styles.error}>{error}</div>}

               {showForm && (
                  <div className={styles.formContainer}>
                     <h2>Add New User</h2>
                     <form onSubmit={handleSubmit} className={styles.userForm}>
                        <div className={styles.formGroup}>
                           <label htmlFor="firstName">First Name:</label>
                           <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                           />
                        </div>

                        <div className={styles.formGroup}>
                           <label htmlFor="lastName">Last Name:</label>
                           <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                           />
                        </div>

                        <div className={styles.formGroup}>
                           <label htmlFor="email">Email:</label>
                           <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                           />
                        </div>

                        <div className={styles.formGroup}>
                           <label htmlFor="phone">Phone:</label>
                           <input
                              type="text"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                           />
                        </div>

                        <div className={styles.formGroup}>
                           <label htmlFor="password">Password:</label>
                           <input
                              type="password"
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                           />
                        </div>

                        <div className={styles.formGroup}>
                           <label htmlFor="role">Role:</label>
                           <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                           >
                              <option value="student">Student</option>
                              <option value="lecturer">Lecturer</option>
                           </select>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                           Create User
                        </button>
                     </form>
                  </div>
               )}

               <div className={styles.userList}>
                  <h2>Existing Users</h2>
                  {loading ? (
                     <p>Loading users...</p>
                  ) : users.length === 0 ? (
                     <p>No users found.</p>
                  ) : (
                     <div className={styles.userGrid}>
                        {users.map((u) => (
                           <div key={u.id} className={styles.userCard}>
                              <h3>
                                 {u.firstName} {u.lastName}
                              </h3>
                              <p>
                                 <strong>Email:</strong> {u.email}
                              </p>
                              <p>
                                 <strong>Phone:</strong> {u.phone || "N/A"}
                              </p>
                              <p>
                                 <strong>Role:</strong> {u.role}
                              </p>
                              <div className={styles.cardActions}>
                                 <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(u.id)}
                                 >
                                    Delete
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </DashboardLayout>
      </ProtectedRoute>
   );
}
