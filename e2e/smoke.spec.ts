import { expect, test } from "@playwright/test";

test("첫 화면은 이름과 사번으로 입장하는 양식을 보여 준다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Tally");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tally에 입장하기");
  await expect(page.getByLabel("이름")).toBeVisible();
  await expect(page.getByLabel("사번")).toBeVisible();
});
