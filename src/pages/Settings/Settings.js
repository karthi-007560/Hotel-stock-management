import React, { useEffect, useState } from "react";
import {
  Save,
  Sun,
  Moon,
  LayoutDashboard,
  Sparkles,
  Check,
} from "lucide-react";

import {
  Header,
  Panel,
  Button,
} from "../../components/UI/UI";

import {
  getSettings,
  saveSettings,
} from "../../utils/store";

import "./Settings.css";

const DEFAULT_APPEARANCE = {
  theme: "indigo",
  mode: "light",
  style: "modern",
};

const COLORS = [
  { id: "indigo", name: "Indigo", color: "#6366f1" },
  { id: "blue", name: "Blue", color: "#2563eb" },
  { id: "green", name: "Green", color: "#059669" },
  { id: "purple", name: "Purple", color: "#8b5cf6" },
  { id: "orange", name: "Orange", color: "#f97316" },
  { id: "rose", name: "Rose", color: "#e11d48" },
];

const STYLES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean cards and soft shadows",
  },
  {
    id: "glass",
    name: "Glass",
    description: "Transparent surfaces and blur",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and clean layout",
  },
];

function readAppearance() {
  return {
    theme: localStorage.getItem("hotel_theme") || DEFAULT_APPEARANCE.theme,
    mode: localStorage.getItem("hotel_mode") || DEFAULT_APPEARANCE.mode,
    style: localStorage.getItem("hotel_style") || DEFAULT_APPEARANCE.style,
  };
}

function applyAppearance(appearance) {
  const root = document.documentElement;

  root.setAttribute("data-theme", appearance.theme);
  root.setAttribute("data-mode", appearance.mode);
  root.setAttribute("data-style", appearance.style);
}

function persistAppearance(appearance) {
  localStorage.setItem("hotel_theme", appearance.theme);
  localStorage.setItem("hotel_mode", appearance.mode);
  localStorage.setItem("hotel_style", appearance.style);

  applyAppearance(appearance);
}

export default function Settings() {
  const [form, setForm] = useState(() => getSettings());
  const [appearance, setAppearance] = useState(readAppearance);
  const [saved, setSaved] = useState(false);

  const { theme, mode, style } = appearance;

  useEffect(() => {
    // Restore persisted appearance when Settings opens.
    const current = readAppearance();
    setAppearance(current);
    applyAppearance(current);

    const reloadSettings = () => {
      setForm(getSettings());

      const updatedAppearance = readAppearance();
      setAppearance(updatedAppearance);
      applyAppearance(updatedAppearance);
    };

    window.addEventListener("hotel_data_updated", reloadSettings);

    return () => {
      window.removeEventListener(
        "hotel_data_updated",
        reloadSettings
      );
    };
  }, []);

  const updateAppearance = (key, value) => {
    setAppearance((previous) => {
      const updated = {
        ...previous,
        [key]: value,
      };

      // Update the actual app immediately.
      applyAppearance(updated);

      return updated;
    });

    setSaved(false);
  };

  const handleSave = (event) => {
    event?.preventDefault?.();

    try {
      saveSettings(form);
      persistAppearance(appearance);

      setSaved(true);

      // Notify other components without resetting appearance.
      window.dispatchEvent(new Event("hotel_data_updated"));
    } catch (error) {
      console.error("Could not save settings:", error);
      alert("Settings save panna mudiyala. Please try again.");
    }
  };

  const selectedColor =
    COLORS.find((item) => item.id === theme) || COLORS[0];

  const selectedStyle =
    STYLES.find((item) => item.id === style) || STYLES[0];

  return (
    <div className="page settingsPage">
      <Header
        title="Appearance Settings"
        subtitle="Customize your hotel dashboard"
        action={
          <Button onClick={handleSave}>
            <Save size={17} />
            Save Changes
          </Button>
        }
      />

      <Panel
        title="Theme Color"
        subtitle="Choose your dashboard accent color"
      >
        <div className="colorGrid">
          {COLORS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`colorOption ${
                theme === item.id ? "selected" : ""
              }`}
              onClick={() => updateAppearance("theme", item.id)}
              aria-pressed={theme === item.id}
            >
              <span
                className="colorCircle"
                style={{ backgroundColor: item.color }}
              >
                {theme === item.id && (
                  <Check size={18} color="#ffffff" />
                )}
              </span>

              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        title="Appearance Mode"
        subtitle="Switch between light and dark mode"
      >
        <div className="appearanceGrid">
          <button
            type="button"
            className={`appearanceOption ${
              mode === "light" ? "selected" : ""
            }`}
            onClick={() => updateAppearance("mode", "light")}
            aria-pressed={mode === "light"}
          >
            <div className="appearanceIcon lightIcon">
              <Sun size={25} />
            </div>

            <div>
              <strong>Light Mode</strong>
              <p>Bright background and dark text</p>
            </div>

            {mode === "light" && (
              <Check size={19} className="selectedCheck" />
            )}
          </button>

          <button
            type="button"
            className={`appearanceOption ${
              mode === "dark" ? "selected" : ""
            }`}
            onClick={() => updateAppearance("mode", "dark")}
            aria-pressed={mode === "dark"}
          >
            <div className="appearanceIcon darkIcon">
              <Moon size={25} />
            </div>

            <div>
              <strong>Dark Mode</strong>
              <p>Dark background and light text</p>
            </div>

            {mode === "dark" && (
              <Check size={19} className="selectedCheck" />
            )}
          </button>
        </div>
      </Panel>

      <Panel
        title="Dashboard Style"
        subtitle="Choose your dashboard card appearance"
      >
        <div className="styleGrid">
          {STYLES.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`styleOption ${
                style === item.id ? "selected" : ""
              }`}
              onClick={() => updateAppearance("style", item.id)}
              aria-pressed={style === item.id}
            >
              <div className={`stylePreview ${item.id}`}>
                <div className="previewHeader" />
                <div className="previewContent">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="styleInfo">
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>

              {style === item.id && (
                <Check size={18} className="selectedCheck" />
              )}
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        title="Live Preview"
        subtitle="Preview updates as you select your preferences"
      >
        <div
          className={`settingsPreview ${theme} ${mode} ${style}`}
          data-theme={theme}
          data-mode={mode}
          data-style={style}
          style={{
            "--preview-primary": selectedColor.color,
          }}
        >
          <div className="previewDashboardHeader">
            <div className="previewDashboardIcon">
              <LayoutDashboard size={22} />
            </div>

            <div>
              <strong>Hotel Dashboard</strong>
              <p>Stock Management Overview</p>
            </div>

            <Sparkles size={21} className="previewSparkle" />
          </div>

          <div className="previewStats">
            <div className="previewStatCard">
              <span>Total Stock</span>
              <strong>248 Items</strong>
              <small>Inventory overview</small>
            </div>

            <div className="previewStatCard">
              <span>Today's Usage</span>
              <strong>36 Items</strong>
              <small>Daily consumption</small>
            </div>
          </div>

          <div className="previewStockSection">
            <div className="previewStockHeading">
              <strong>Stock Overview</strong>
              <span className="previewLiveBadge">
                <span />
                Preview
              </span>
            </div>

            <div className="previewStockRow previewStockTableHeader">
              <span>Item</span>
              <span>Available Stock</span>
              <span>Status</span>
            </div>

            <div className="previewStockRow">
              <span>Rice</span>
              <strong>50 kg</strong>
              <span className="previewStockStatus available">
                In Stock
              </span>
            </div>

            <div className="previewStockRow">
              <span>Cooking Oil</span>
              <strong>12 L</strong>
              <span className="previewStockStatus low">
                Low Stock
              </span>
            </div>

            <div className="previewStockRow">
              <span>Sugar</span>
              <strong>25 kg</strong>
              <span className="previewStockStatus available">
                In Stock
              </span>
            </div>
          </div>

          <div className="previewFooter">
            <span
              className="previewStatusDot"
              style={{ backgroundColor: selectedColor.color }}
            />

            <span>
              {selectedColor.name} ·{" "}
              {mode === "dark" ? "Dark Mode" : "Light Mode"} ·{" "}
              {selectedStyle.name}
            </span>
          </div>
        </div>
      </Panel>

      <div className="settingsSave">
        <div>
          <strong>
            {saved ? "Settings Saved" : "Customize Your Dashboard"}
          </strong>
          <p>
            {saved
              ? "Your preferences have been saved."
              : "Select a theme and save to keep it after reload."}
          </p>
        </div>

        <Button onClick={handleSave}>
          <Save size={17} />
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
