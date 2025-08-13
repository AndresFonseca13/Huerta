import { readdirSync, statSync } from "fs";
import { join } from "path";

describe("Project Structure Tests", () => {
	test("should have required directories", () => {
		const requiredDirs = [
			"controllers",
			"services",
			"routes",
			"middleware",
			"config",
			"errors",
		];

		requiredDirs.forEach((dir) => {
			try {
				const stats = statSync(join(process.cwd(), dir));
				expect(stats.isDirectory()).toBe(true);
			} catch {
				fail(`Directory ${dir} should exist`);
			}
		});
	});

	test("should have services structure", () => {
		const servicesDir = join(process.cwd(), "services");
		const serviceCategories = readdirSync(servicesDir);

		expect(serviceCategories).toContain("product");
		expect(serviceCategories).toContain("category");
		expect(serviceCategories).toContain("ingredient");
	});

	test("should have main application file", () => {
		const appFile = join(process.cwd(), "app.js");
		try {
			const stats = statSync(appFile);
			expect(stats.isFile()).toBe(true);
		} catch {
			fail("app.js should exist");
		}
	});
});
