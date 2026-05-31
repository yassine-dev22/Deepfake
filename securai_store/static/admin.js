// ===== ADMIN DASHBOARD - REAL-TIME POLLING =====
// Fetches data from /api/admin_stats every 500ms and updates all dashboard elements

const POLL_INTERVAL = 500; // ms

// Start polling on page load
document.addEventListener('DOMContentLoaded', () => {
  startPolling();
});

// ===== POLLING FUNCTION =====
function startPolling() {
  // Fetch immediately on load
  fetchAndUpdateDashboard();
  
  // Then set interval for continuous updates
  setInterval(fetchAndUpdateDashboard, POLL_INTERVAL);
}

function fetchAndUpdateDashboard() {
  fetch('/api/admin_stats')
    .then(response => {
      if (!response.ok) {
        console.error('API Error:', response.status);
        return null;
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        updateMetrics(data);
        updateIdentity(data);
        updateAttackStatus(data);
        updateModes(data);
        updateLogs(data);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

// ===== 1. UPDATE METRICS (FPS, LATENCE, SCORE FFT) =====
function updateMetrics(data) {
  // FPS
  if (data.fps !== undefined) {
    const fpsValue = document.getElementById('fps-value');
    if (fpsValue) {
      fpsValue.textContent = data.fps.toFixed(1);
    }
    
    // Update FPS progress bar (scale 0-60)
    const fpsProgress = document.getElementById('fps-progress');
    if (fpsProgress) {
      const fpsPercent = Math.min((data.fps / 60) * 100, 100);
      fpsProgress.style.width = fpsPercent + '%';
    }
  }
  
  // LATENCE (check multiple field names for compatibility)
  const latency = data.latency_ms || data.hf_latency_ms || data.infer_ms;
  if (latency !== undefined) {
    const latencyValue = document.getElementById('latency-value');
    if (latencyValue) {
      latencyValue.textContent = latency.toFixed(0) + 'ms';
    }
    
    // Update Latence progress bar (scale 0-300ms)
    const latencyProgress = document.getElementById('latency-progress');
    if (latencyProgress) {
      const latencyPercent = Math.min((latency / 300) * 100, 100);
      latencyProgress.style.width = latencyPercent + '%';
    }
  }
  
  // SCORE FFT / ANOMALY
  if (data.anomaly_score !== undefined) {
    const anomalyValue = document.getElementById('anomaly-value');
    if (anomalyValue) {
      const anomalyPercent = (data.anomaly_score * 100).toFixed(0);
      anomalyValue.textContent = anomalyPercent + '%';
    }
    
    // Update Anomaly progress bar (scale 0-1 = 0-100%)
    const anomalyProgress = document.getElementById('anomaly-progress');
    if (anomalyProgress) {
      const anomalyPercent = Math.min(data.anomaly_score * 100, 100);
      anomalyProgress.style.width = anomalyPercent + '%';
    }
  }
}

// ===== 2. UPDATE IDENTITY & ACCESS STATUS =====
function updateIdentity(data) {
  const identityName = document.getElementById('identity-name');
  const identityBadge = document.getElementById('identity-badge');
  const identityTimestamp = document.getElementById('identity-timestamp');
  
  if (!identityName || !identityBadge) return;
  
  // Check if identity is detected with confidence
  const confidence = data.confidence || 0;
  const hasDetection = data.identity && confidence > 0.5;
  
  if (hasDetection) {
    // Update with detected identity
    identityName.textContent = data.identity;
    
    // Update access badge: DENIED (red) or GRANTED (green)
    const accessLevel = data.access_level || 'DENIED';
    if (accessLevel.toUpperCase() === 'GRANTED' || accessLevel.toUpperCase() === 'ALLOWED') {
      identityBadge.textContent = 'GRANTED';
      identityBadge.style.color = 'var(--green)';
    } else {
      identityBadge.textContent = 'DENIED';
      identityBadge.style.color = 'var(--red)';
    }
    
    // Update timestamp
    if (identityTimestamp) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      identityTimestamp.textContent = `Détection: ${timeStr}`;
    }
  } else {
    // No detection
    identityName.textContent = 'Aucun';
    identityBadge.textContent = 'N/A';
    identityBadge.style.color = 'var(--text-muted)';
    
    if (identityTimestamp) {
      identityTimestamp.textContent = 'Détection: --:--:--';
    }
  }
}

// ===== 3. UPDATE ATTACK STATUS =====
function updateAttackStatus(data) {
  const attackIndicator = document.getElementById('attack-indicator');
  const attackText = document.getElementById('attack-text');
  
  if (!attackIndicator || !attackText) return;
  
  // Check if attack is active
  const isAttacking = data.is_attacking || false;
  
  if (isAttacking) {
    // Attack is active: red pulsing indicator
    attackIndicator.classList.add('active');
    attackText.classList.add('active');
    attackText.textContent = 'INJECTION EN COURS';
  } else {
    // Attack is inactive: gray indicator
    attackIndicator.classList.remove('active');
    attackText.classList.remove('active');
    attackText.textContent = 'DÉSACTIVÉE';
  }
}

// ===== 4. UPDATE EXECUTION MODES =====
function updateModes(data) {
  if (!data.system_mode) return;
  
  const currentMode = data.system_mode.toLowerCase();
  const modeButtons = document.querySelectorAll('.mode-button');
  
  modeButtons.forEach(btn => {
    const modeValue = btn.getAttribute('data-mode');
    
    if (modeValue === currentMode) {
      // Activate this button
      btn.classList.add('active');
    } else {
      // Deactivate others
      btn.classList.remove('active');
    }
  });
}

// ===== 5. UPDATE SYSTEM LOGS =====
function updateLogs(data) {
  const logsContainer = document.getElementById('logs-container');
  if (!logsContainer) return;
  
  const logs = data.logs || [];
  
  // Clear existing logs
  logsContainer.innerHTML = '';
  
  // Add each log entry
  logs.forEach(logEntry => {
    // Handle both string and object log formats
    let timestamp = '';
    let level = 'info';
    let message = '';
    
    if (typeof logEntry === 'string') {
      // Try to parse "YYYY-MM-DD HH:MM:SS,mmm - LEVEL - message"
      const match = logEntry.match(/^\\d{4}-\\d{2}-\\d{2}\\s+(\\d{2}:\\d{2}:\\d{2}),\\d+\\s+-\\s+(\\w+)\\s+-\\s+(.*)$/);
      if (match) {
        timestamp = match[1];
        level = match[2].toLowerCase();
        message = match[3];
      } else {
        message = logEntry;
      }
    } else if (typeof logEntry === 'object') {
      timestamp = logEntry.timestamp || '';
      level = (logEntry.level || 'info').toLowerCase();
      message = logEntry.message || '';
    }
    
    // Normalize level names to CSS classes
    const levelMap = {
      info: 'info',
      warning: 'warn',
      warn: 'warn',
      error: 'alert',
      critical: 'alert',
      alert: 'alert',
      success: 'success'
    };
    level = levelMap[level] || 'info';
    
    // Create log line element
    const logDiv = document.createElement('div');
    logDiv.className = 'log-entry';
    
    let html = '';
    if (timestamp) {
      html += `<span class="log-timestamp">[${timestamp}]</span>`;
    }
    html += `<span class="log-level ${level}">[${level.toUpperCase()}]</span>`;
    html += `<span class="log-message">${escapeHtml(message)}</span>`;
    
    logDiv.innerHTML = html;
    logsContainer.appendChild(logDiv);
  });
  
  // Auto-scroll to bottom
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// ===== UTILITY: Escape HTML to prevent XSS =====
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
