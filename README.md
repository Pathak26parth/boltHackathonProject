# 🎓 Smart Campus Management System (MERN + AI)

A powerful **MERN stack** web application integrated with **AI-based face recognition** to manage attendance, timetables, and academic operations — supporting **Admin**, **Faculty**, and **Student** roles with custom dashboards.

---

## 🌐 Live Demo

> 🚧 _Coming Soon_ — Link to deployment or demo video

---

## 🚀 Key Features

### 🔐 Role-Based Authentication

- **Signup fields**:
  - Username
  - Email
  - Password
  - Department: `CSE`, `ME`, `CE`, `EE`, `ECE`
  - Role: `Admin`, `Faculty`, `Student`

- **Login & Session Management** with JWT
- **Protected Routes** based on user roles

---

### 👑 Admin Dashboard

- 📅 **Create and manage timetables**
- 📚 **Add new subjects**
- 👨‍🏫 **Assign subjects** to faculty (by department & division)
- 👨‍🎓 **Admit new students** into the system

---

### 👨‍🏫 Faculty Dashboard

- 🗂 View **assigned subjects** in card view (division-wise)
- 📷 **Take attendance via CCTV camera stream**
  - Integrated with **AI multi-face detection**
- 📤 Download **Excel reports**:
  - Per subject
  - Per specific date

---

### 👨‍🎓 Student Dashboard

- 📊 View **personal attendance**:
  - Graphical representation (charts)
  - Text summary with **remarks**: `Excellent`, `Good`, `Bad`

---

## 🧠 AI Integration

- 🎥 Connects to **CCTV feed** or webcam
- 🧠 Backend uses **Python + OpenCV (or YOLO)** for real-time **multi-face detection**
- 📝 Matches detected faces with registered students for automated attendance

---

## 🛠 Tech Stack

| Layer         | Technology              |
|---------------|--------------------------|
| Frontend      | React.js + Vite          |
| Backend       | Node.js + Express.js     |
| Database      | MongoDB (Mongoose)       |
| Authentication| JWT + bcryptjs           |
| AI Service    | Python (OpenCV / YOLO)   |
| File Export   | ExcelJS / CSV            |
| Camera Stream | Browser/WebRTC or IP cam |

---

## 🗂 Project Structure
```
### Frontend (React)

client/
├── src/
│ ├── components/ # Shared UI components
│ ├── pages/ # Role-based dashboards
│ ├── services/ # API calls
│ ├── redux/ # State management
│ └── App.jsx / main.jsx


### Backend (Node.js + Express)

server/
├── models/ # Mongoose schemas
├── routes/ # API routes
├── controllers/ # Business logic
├── middleware/ # Auth checks, role guards
├── utils/ # Excel export, helpers
└── server.js # Entry point


```

## 📸 Screenshots

> Add screenshots or GIFs of:
- Login/signup
- Admin dashboard
- Faculty subject cards
- AI attendance
- Student analytics view

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-campus-mern.git
cd smart-campus-mern

Setup Backend
cd server
npm install
# Create .env with MongoDB URI and JWT secret
npm run dev

Setup Frontend
cd client
npm install
npm run dev

📊 Example Flow
Admin logs in → Adds subjects → Assigns faculty → Admits students

Faculty logs in → Views assigned subjects → Takes attendance via CCTV

Student logs in → Views attendance with chart & remarks

📬 Contact
👨‍💼 Project Lead: Parth Pathak
📧 Email: parthpathak@example.com
🔗 LinkedIn: linkedin.com/in/parthpathak

