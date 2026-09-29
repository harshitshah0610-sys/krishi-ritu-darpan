@echo off
echo Installing Playwright dependencies...
python -m pip install playwright
python -m playwright install chromium

echo Recording Video...
python record_demo.py

echo Video saved to Krishi_Ritu_Darpan_Demo.webm
pause
