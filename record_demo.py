import asyncio
import os
import glob
import shutil
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Use headless mode for silent background recording
        browser = await p.chromium.launch(headless=True)
        
        video_dir = os.path.join(os.getcwd(), "demo_video_temp")
        os.makedirs(video_dir, exist_ok=True)
        
        context = await browser.new_context(
            record_video_dir=video_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        print("Navigating to Dashboard...")
        await page.goto("http://localhost:5173")
        await page.wait_for_timeout(3000)

        print("Testing Search & Side Panel...")
        await page.click("input[placeholder='Search panchayat...']")
        await page.wait_for_timeout(1000)
        await page.fill("input[placeholder='Search panchayat...']", "Vasna")
        await page.wait_for_timeout(1000)
        
        # Click the Vasna button
        await page.click("text=Vasna")
        await page.wait_for_timeout(3000)

        # Tab interaction
        print("Clicking tabs...")
        await page.click("text=advisory")
        await page.wait_for_timeout(2500)
        
        await page.click("text=compare")
        await page.wait_for_timeout(3000)

        print("Navigating to Sowing Planner...")
        await page.click("text=Sowing Planner")
        await page.wait_for_timeout(2000)
        
        # Select first option in the dropdown (index 1 is usually the first real option if 0 is disabled/placeholder)
        await page.select_option("select", index=1)
        await page.wait_for_timeout(4000)

        print("Navigating to GP Admin Hub...")
        await page.click("text=GP Admin Hub")
        await page.wait_for_timeout(2000)
        await page.select_option("select", index=2)
        await page.wait_for_timeout(4000)

        print("Navigating to Model Accuracy...")
        await page.click("text=Model Accuracy")
        await page.wait_for_timeout(4000)

        await context.close()
        await browser.close()
        
        # Move and rename the generated webm file
        files = glob.glob(os.path.join(video_dir, "*.webm"))
        if files:
            video_path = files[0]
            final_path = os.path.join(os.getcwd(), "Krishi_Ritu_Darpan_Demo.webm")
            shutil.move(video_path, final_path)
            print(f"Video saved successfully to {final_path}")
        else:
            print("Video file not found.")

asyncio.run(run())
