// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Planner } from "./planner";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));

let root: Root;
let host: HTMLDivElement;
let mobile = false;
const mediaListeners = new Set<() => void>();
const date = (value: string) => host.querySelector<HTMLButtonElement>(`button[data-date="${value}"]`)!;
const panel = () => host.querySelector<HTMLElement>("#break-details")!;
const options = () => [...panel().querySelectorAll<HTMLButtonElement>('section[aria-label="Compare breaks"] button')];
const byLabel = (label: string) => host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
const click = async (element: HTMLElement, keyboard = false) => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: keyboard ? 0 : 1 }));
  });
};
const tick = async () => { await act(async () => { vi.advanceTimersByTime(1000); }); };
const focus = async (element: HTMLElement) => { await act(async () => element.focus()); };
const pointer = async (element: HTMLElement, type: "pointerover" | "pointerout") => {
  const event = new MouseEvent(type, { bubbles: true });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  await act(async () => { element.dispatchEvent(event); });
};
const render = async () => { await act(async () => root.render(<Planner initialYear={2027} />)); };

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));
  mobile = false;
  mediaListeners.clear();
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return mobile; },
    addEventListener: (_: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => mediaListeners.delete(listener),
  }));
  // jsdom has no top layer. These shims exercise our lifecycle, not native trapping.
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  window.history.replaceState({}, "", "/?year=2027");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("desktop leave planning", () => {
  it("starts without an unrelated selected recommendation", async () => {
    await render();
    expect(panel().textContent).toContain("Pick a date");
    expect(host.querySelectorAll('button[data-date][aria-pressed="true"]')).toHaveLength(0);
  });

  it("keeps a preview while crossing the calendar to the details panel", async () => {
    await render();
    await pointer(date("2027-03-26"), "pointerover");
    const preview = panel().textContent;
    expect(preview).toContain("March break");
    await pointer(date("2027-03-26"), "pointerout");
    await tick();
    expect(panel().textContent).toBe(preview);
  });

  it("pins on click, ignores stray hover, and switches on a new click", async () => {
    await render();
    await click(date("2027-03-26"));
    const selected = panel().textContent;
    await pointer(date("2027-08-09"), "pointerover");
    expect(panel().textContent).toBe(selected);
    await click(date("2027-08-09"));
    expect(panel().textContent).toContain("August break");
  });

  it("keeps comparison buttons and keyboard focus stable, then clears at the anchor", async () => {
    await render();
    await click(date("2027-03-26"));
    const originalOptions = options();
    const noLeave = originalOptions.find((button) => button.textContent?.startsWith("No leave"))!;
    await focus(noLeave);
    await click(noLeave, true);
    expect(options()).toEqual(originalOptions);
    expect(document.activeElement).toBe(noLeave);
    expect(noLeave.getAttribute("aria-pressed")).toBe("true");
    expect(panel().textContent).toContain("No leave needed");
    expect(panel().querySelector('[aria-label="Leave dates"]')).toBeNull();
    expect(date("2027-03-26").getAttribute("aria-label")).toContain("0 leave days gives 3 days off");
    expect(host.querySelectorAll('button[data-date][aria-pressed="true"]')).toHaveLength(1);
    await click(date("2027-03-26"));
    expect(panel().textContent).toContain("Pick a date");
  });

  it("takes keyboard activation to details, and clear returns focus without reopening", async () => {
    await render();
    await focus(date("2027-03-26"));
    await click(date("2027-03-26"), true);
    await tick();
    expect(document.activeElement?.id).toBe("break-title");
    await click(byLabel("Clear selection"));
    await tick();
    expect(document.activeElement).toBe(date("2027-03-26"));
    expect(panel().textContent).toContain("Pick a date");
  });

  it("recalculates workplace policy without stealing settings focus", async () => {
    await render();
    await click(date("2027-12-25"));
    await click(byLabel("Settings"));
    await tick();
    const toggle = host.querySelector<HTMLInputElement>('input[aria-label="My workplace gives Monday off for Saturday PH"]')!;
    await focus(toggle);
    await click(toggle, true);
    await tick();
    expect(document.activeElement).toBe(toggle);
    expect(byLabel("Settings").getAttribute("aria-expanded")).toBe("true");
    expect(panel().textContent).toContain("Pick a date");
    await act(async () => toggle.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    await tick();
    expect(document.activeElement).toBe(byLabel("Settings"));
  });

  it("handles fast Settings open-close without reopening and closes when focus leaves", async () => {
    await render();
    await click(byLabel("Settings"));
    await click(byLabel("Settings"));
    await tick();
    expect(byLabel("Settings").getAttribute("aria-expanded")).toBe("false");
    expect(host.querySelector("#planner-settings")?.hasAttribute("inert")).toBe(true);
    await click(byLabel("Settings"));
    await focus(host.querySelector<HTMLInputElement>('input[aria-label="School breaks"]')!);
    await focus(date("2027-03-26"));
    expect(byLabel("Settings").getAttribute("aria-expanded")).toBe("false");
  });

  it("Escape clears a selected plan without restoring the default recommendation", async () => {
    await render();
    await click(date("2027-03-26"));
    await act(async () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true })));
    await tick();
    expect(panel().textContent).toContain("Pick a date");
    expect(document.activeElement).toBe(date("2027-03-26"));
  });

  it("school shading leaves calculations alone and labels school-specific dates", async () => {
    await render();
    await click(date("2027-03-26"));
    const before = panel().textContent;
    await click(byLabel("Settings"));
    await tick();
    await click(host.querySelector('input[aria-label="School breaks"]')!);
    expect(panel().textContent).toBe(before);
    expect(host.querySelector('[title*="Children\'s Day"]')?.getAttribute("title")).toContain("primary schools");
  });

  it("year switches clear selection, preserve the year button and hide the inactive year", async () => {
    await render();
    await click(date("2027-03-26"));
    const yearButton = byLabel("2027 calendar. Show 2028");
    await focus(yearButton);
    await click(yearButton, true);
    expect(window.location.search).toBe("?year=2028");
    expect(document.activeElement).toBe(yearButton);
    expect(host.querySelector('[data-page-id="1"]')?.hasAttribute("inert")).toBe(true);
    expect(host.querySelector('[data-page-id="2"]')?.getAttribute("aria-hidden")).toBe("false");
    expect(panel().textContent).toContain("Pick a date");
    await click(date("2028-04-14"));
    expect(panel().textContent).toContain("Provisional dates");
  });
});

describe("mobile sheet lifecycle", () => {
  it("opens on tap, keeps alternatives focused, and closes with Escape cleanly", async () => {
    mobile = true;
    await render();
    await click(date("2027-03-26"));
    expect(panel().hasAttribute("open")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    const other = options()[1];
    await focus(other);
    await click(other, true);
    expect(document.activeElement).toBe(other);
    expect(panel().hasAttribute("open")).toBe(true);
    await act(async () => panel().dispatchEvent(new Event("cancel", { bubbles: false, cancelable: true })));
    await tick();
    expect(panel().hasAttribute("open")).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(date("2027-03-26"));
  });

  it("releases body scroll when a selected sheet becomes a desktop panel", async () => {
    mobile = true;
    await render();
    await click(date("2027-03-26"));
    await act(async () => { mobile = false; mediaListeners.forEach((listener) => listener()); });
    expect(panel().tagName).toBe("ASIDE");
    expect(document.body.style.overflow).toBe("");
  });
});
