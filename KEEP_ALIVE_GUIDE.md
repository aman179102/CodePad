# 🔄 Keep Server Alive Guide

## 🚨 Problem: Free hosting services sleep after inactivity

Render, Railway, और अन्य free hosting services आपके server को 15 minutes inactivity के बाद sleep mode में डाल देती हैं।

## ✅ Solutions Implemented:

### 1. Health Check Endpoint
```
GET /api/health
```
- Server status check करने के लिए
- Response: `{ status: 'healthy', timestamp: '...', uptime: 123 }`

### 2. External Ping Services (Recommended)

#### **UptimeRobot** (Free - Best Option)
1. Visit: https://uptimerobot.com
2. Sign up for free account
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-app.onrender.com/api/health`
   - Interval: 5 minutes
4. ✅ Your server will never sleep!

#### **Cron-job.org** (Free Alternative)
1. Visit: https://cron-job.org
2. Create free account
3. Add cronjob:
   - URL: `https://your-app.onrender.com/api/health`
   - Schedule: `*/14 * * * *` (every 14 minutes)

### 3. Self-Ping Script (Local)
```bash
# Run locally to keep server alive
node keep-alive.js
```

## 🎯 Best Practice:
**Use UptimeRobot** - यह सबसे reliable है और आपको email alerts भी देता है अगर server down हो जाए।

## 📊 Monitoring:
- UptimeRobot dashboard से server uptime देख सकते हैं
- Email notifications मिलेंगे अगर कोई issue हो

## ⚡ Quick Setup:
1. Deploy your app on Render
2. Copy the URL
3. Add to UptimeRobot
4. Done! ✅ Server हमेशा alive रहेगा
