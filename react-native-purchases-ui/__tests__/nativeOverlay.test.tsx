import type React from "react";

type Props = Record<string, unknown>;
const mockPlatform = { OS: "ios" };
const mockViewManagerConfig: { value: object | null } = { value: {} };
const mockRequireNativeComponent = jest.fn((name: string) => `Native(${name})`);

jest.mock("react-native", () => ({
  Modal: "Modal",
  Platform: mockPlatform,
  UIManager: { getViewManagerConfig: () => mockViewManagerConfig.value },
  requireNativeComponent: mockRequireNativeComponent,
  useWindowDimensions: () => ({ width: 390, height: 844 }),
}));

const loadNativeOverlay = () => {
  jest.resetModules();
  return require("../src/nativeOverlay") as typeof import("../src/nativeOverlay");
};

const render = (component: React.FC<any>, props: Props) =>
  component(props as never, {}) as React.ReactElement<Props>;

describe("NativeOverlay", () => {
  beforeEach(() => {
    mockPlatform.OS = "ios";
    mockViewManagerConfig.value = {};
    mockRequireNativeComponent.mockClear();
  });

  it("uses the native host on iOS when the view manager is installed", () => {
    const { NativeOverlay, NATIVE_OVERLAY_VIEW_NAME } = loadNativeOverlay();
    const onShow = jest.fn();
    const onDismiss = jest.fn();

    const element = render(NativeOverlay, { visible: true, children: "content", onShow, onDismiss });

    expect(mockRequireNativeComponent).toHaveBeenCalledWith(NATIVE_OVERLAY_VIEW_NAME);
    expect(element.type).toBe(`Native(${NATIVE_OVERLAY_VIEW_NAME})`);
    expect(element.props.visible).toBe(true);
    expect(element.props.pointerEvents).toBe("none");
    expect(element.props.style).toEqual({ position: "absolute", top: 0, left: 0, width: 390, height: 844 });
    expect(element.props.children).toBe("content");

    (element.props.onShow as () => void)();
    (element.props.onDismiss as () => void)();
    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not render children while hidden", () => {
    const { NativeOverlay } = loadNativeOverlay();

    const element = render(NativeOverlay, { visible: false, children: "content" });

    expect(element.props.visible).toBe(false);
    expect(element.props.children).toBeNull();
  });

  it("falls back to a transparent Modal when the native host is unavailable", () => {
    mockViewManagerConfig.value = null;
    const { NativeOverlay } = loadNativeOverlay();
    const onDismiss = jest.fn();

    const element = render(NativeOverlay, { visible: true, children: "content", onDismiss });

    expect(mockRequireNativeComponent).not.toHaveBeenCalled();
    expect(element.type).toBe("Modal");
    expect(element.props.transparent).toBe(true);
    expect(element.props.visible).toBe(true);
    expect(element.props.onDismiss).toBe(onDismiss);
    expect(element.props.onRequestClose).toBe(onDismiss);
    expect(element.props.children).toBe("content");
  });

  it("falls back to a Modal on Android", () => {
    mockPlatform.OS = "android";
    const { NativeOverlay } = loadNativeOverlay();

    const element = render(NativeOverlay, { visible: true });

    expect(mockRequireNativeComponent).not.toHaveBeenCalled();
    expect(element.type).toBe("Modal");
  });
});
