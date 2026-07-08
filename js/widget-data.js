// ============================================
// SMART GRADE - WIDGET DATA SYSTEM
// Version: 4.1
// ============================================

function updateWidgetData() {
  var currentUser = getCurrentStudent();
  if (!currentUser) return;
  
  var widgetData = {
    version: '1.0',
    timestamp: Date.now(),
    studentName: currentUser.name,
    overallAvg: calculateYearlyAverage(currentUser.id),
    totalGrades: getStudentGrades(currentUser.id).length,
    streakDays: getStudentStreak(currentUser.id).days,
    lastUpdate: new Date().toISOString()
  };
  
  localStorage.setItem('smartgrade_widget_data', JSON.stringify(widgetData));
}

function getWidgetData() {
  var data = localStorage.getItem('smartgrade_widget_data');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch(e) {
    return null;
  }
}

setInterval(updateWidgetData, 60 * 60 * 1000);

document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    updateWidgetData();
  }
});

updateWidgetData();