import { describe, expect, it } from "bun:test";
import { isObject } from "@/lib/objects";

describe("@/lib/objects.ts", () => {
	describe("isObject()", () => {
		it("should return true for objects", () => {
			expect(isObject({})).toBe(true);
			expect(isObject({ foo: 123 })).toBe(true);
			expect(isObject(Object.freeze({}))).toBe(true);
		});

		it("should return false for null", () => {
			expect(isObject(null)).toBe(false);
		});

		[
			undefined,
			123,
			"foobar",
			(): any => ({}),
			Function,
			String(123),
			isObject,
			(): any => null,
			[],
			[1, 2, 3],
		].forEach((value) => {
			it(`should return false for ${typeof value} (${String(value)})`, () => {
				expect(isObject(value)).toBe(false);
			});
		});
	});
});
