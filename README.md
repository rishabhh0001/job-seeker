# 🚀 Django Job Portal (Premium Edition)

A state-of-the-art Job Portal application featuring a **Glassmorphism UI**, **3D Animations**, and robust **Role-Based Authentication**.


![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)


## ✨ Premium Features
- **3D Hero Section**: Interactive particle network animation using `Vanta.js` (powered by Three.js).
- **3D Tilt Cards**: Job listings respond to mouse movement with `Vanilla-Tilt.js`.
- **Glassmorphism Design**: Modern, translucent UI elements with background blur.
- **Role-Based System**: Distinct workflows for **Employers** (Post Jobs) and **Seekers** (Apply).
- **Secure Auth**: Powered by `django-allauth` and `django-cap` (Proof-of-Work CAPTCHA).


## 🖥️ Usage Guide


### For Employers
1. **Register** and check "I am an Employer".
2. Access your **Employer Dashboard**.
3. **Post a Job** to the public board.
4. Review applications and download resumés.

### For Job Seekers
1. **Browse** the 3D-enhanced job feed.
2. Use real-time filters for Location/Category.
3. **Apply** seamlessly with PDF resume upload.


## 📂 Project Structure
- `jobs/` - Core application logic.
- `jobs/templates` - HTML files with AOS/Three.js integration.
- `jobs/static` - CSS/JS assets including premium themes.

---

Built using Django & Bootstrap 5.