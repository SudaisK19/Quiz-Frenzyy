/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, act } from "@testing-library/react";
import PageLoader from "./PageLoader";

// next/navigation ko mock karen ge taake usePathname control kar saken
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));
import { usePathname } from "next/navigation";

describe("<PageLoader />", () => {
  beforeEach(() => {
    // timers ko control karne ke liye fake timers use karain
    jest.useFakeTimers();
    // initial pathname set karen
    (usePathname as jest.Mock).mockReturnValue("/initial");
  });

  afterEach(() => {
    // pending timers clear karen aur real timers wapas laen
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("mount hote hi loader show karta hai", () => {
    const { container } = render(<PageLoader />);
    // loader overlay pehla child hona chahiye
    expect(container.firstChild).not.toBeNull();
  });

  it("400ms ke baad loader hide ho jata hai", () => {
    const { container } = render(<PageLoader />);
    // pehle loader maujood hai
    expect(container.firstChild).not.toBeNull();

    act(() => {
      // 400ms aage badhain
      jest.advanceTimersByTime(400);
    });

    // ab loader gayab ho jana chahiye
    expect(container.firstChild).toBeNull();
  });

  it("pathname change hone par loader dobara show hota hai", () => {
    const { container, rerender } = render(<PageLoader />);

    // pehle timeout complete kar dein
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(container.firstChild).toBeNull();

    // ab new pathname mock karen
    (usePathname as jest.Mock).mockReturnValue("/new-path");

    // component ko rerender karen takay useEffect dobara chale
    rerender(<PageLoader />);

    // dobara loader show hona chahiye
    expect(container.firstChild).not.toBeNull();
  });
});
