// 在主页上添加AI主动说话设置面板
document.addEventListener('DOMContentLoaded', function() {
    // 等待页面加载完成
    setTimeout(function() {
        addProactiveSettingsPanel();
    }, 1000);
});

function addProactiveSettingsPanel() {
    // 创建设置面板
    const settingsPanel = document.createElement('div');
    settingsPanel.style.position = 'fixed';
    settingsPanel.style.bottom = '20px';
    settingsPanel.style.right = '20px';
    settingsPanel.style.width = '300px';
    settingsPanel.style.padding = '15px';
    settingsPanel.style.backgroundColor = '#f9f9f9';
    settingsPanel.style.border = '2px solid #007bff';
    settingsPanel.style.borderRadius = '8px';
    settingsPanel.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    settingsPanel.style.zIndex = '1000';
    settingsPanel.style.fontFamily = 'Arial, sans-serif';

    settingsPanel.innerHTML = `
        <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">AI主动说话设置</h3>
        <div>
            <label for="proactivePrompt" style="display: block; margin-bottom: 5px; font-weight: bold;">主动说话提示词：</label>
            <textarea id="proactivePrompt" placeholder="输入提示词，引导AI主动说话的内容" 
                style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;"></textarea>
        </div>
        <button id="saveProactiveSettings" 
            style="background: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
            保存设置
        </button>
        <div id="proactiveStatus" style="margin-top: 10px; font-size: 14px;"></div>
        <button id="toggleSettingsPanel" 
            style="position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 16px;">
            ×
        </button>
    `;

    // 添加到页面
    document.body.appendChild(settingsPanel);

    // 从localStorage加载保存的设置
    const savedPrompt = localStorage.getItem('proactivePrompt') || '';
    document.getElementById('proactivePrompt').value = savedPrompt;

    // 保存设置
    document.getElementById('saveProactiveSettings').addEventListener('click', function() {
        const prompt = document.getElementById('proactivePrompt').value;
        localStorage.setItem('proactivePrompt', prompt);
        
        const statusElem = document.getElementById('proactiveStatus');
        statusElem.textContent = '设置已保存！';
        statusElem.style.color = '#006600';
        
        setTimeout(() => {
            statusElem.textContent = '';
        }, 3000);
    });

    // 切换面板显示
    let isPanelVisible = true;
    const toggleButton = document.getElementById('toggleSettingsPanel');
    
    toggleButton.addEventListener('click', function() {
        if (isPanelVisible) {
            settingsPanel.style.width = 'auto';
            settingsPanel.style.height = 'auto';
            settingsPanel.style.padding = '0';
            settingsPanel.style.overflow = 'hidden';
            
            // 隐藏所有子元素，只保留切换按钮
            Array.from(settingsPanel.children).forEach(child => {
                if (child !== toggleButton) {
                    child.style.display = 'none';
                }
            });
            
            toggleButton.textContent = '⚙️';
            toggleButton.style.position = 'static';
            toggleButton.style.padding = '10px';
            toggleButton.style.fontSize = '20px';
        } else {
            settingsPanel.style.width = '300px';
            settingsPanel.style.padding = '15px';
            
            // 显示所有子元素
            Array.from(settingsPanel.children).forEach(child => {
                child.style.display = '';
            });
            
            toggleButton.textContent = '×';
            toggleButton.style.position = 'absolute';
            toggleButton.style.top = '10px';
            toggleButton.style.right = '10px';
            toggleButton.style.padding = '0';
            toggleButton.style.fontSize = '16px';
        }
        
        isPanelVisible = !isPanelVisible;
    });

    // 拦截WebSocket消息发送
    const originalWebSocketSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
        try {
            const parsedData = JSON.parse(data);
            
            // 如果是主动说话信号，添加自定义提示词
            if (parsedData.type === 'ai-speak-signal') {
                const customPrompt = localStorage.getItem('proactivePrompt') || '';
                parsedData.proactive_prompt = customPrompt;
                console.log('已添加自定义提示词到AI主动说话信号:', customPrompt);
                return originalWebSocketSend.call(this, JSON.stringify(parsedData));
            }
        } catch (e) {
            // 如果不是JSON或解析出错，直接发送原始数据
        }
        
        return originalWebSocketSend.call(this, data);
    };

    console.log('AI主动说话设置面板已加载');
} 