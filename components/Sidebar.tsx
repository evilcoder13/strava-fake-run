"use client";

import { useRouteStore } from "@/store/useRouteStore";
import dynamic from "next/dynamic";
import { Trash2, GripVertical, Footprints, PersonStanding, Bike, Mountain, Search, Navigation, Share2 } from "lucide-react";
import { useState } from "react";

const ActivityCharts = dynamic(() => import("./ActivityCharts"), { ssr: false });
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { type Waypoint } from "@/store/useRouteStore";

import { exportGPX } from "@/lib/export/gpx";
import { exportTCX } from "@/lib/export/tcx";
import { ActivityType } from "@/lib/types/activity";
import { SPORT_PROFILES } from "@/lib/sport-profiles";
import type { LucideIcon } from "lucide-react";

// Activity type selector options
const ACTIVITY_OPTIONS: { type: ActivityType; label: string; icon: LucideIcon }[] = [
  { type: ActivityType.Running, label: 'Run',   icon: Footprints },
  { type: ActivityType.Walking, label: 'Walk',  icon: PersonStanding },
  { type: ActivityType.Cycling, label: 'Cycle', icon: Bike },
  { type: ActivityType.Hiking,  label: 'Hike',  icon: Mountain },
];

// Generate standard timezone offsets
const TIMEZONE_OPTIONS: { value: string; label: string }[] = [];
for (let i = -12; i <= 14; i++) {
  const sign = i < 0 ? "-" : "+";
  const hm = `${Math.abs(i).toString().padStart(2, "0")}:00`;
  TIMEZONE_OPTIONS.push({ value: `${sign}${hm}`, label: `UTC ${sign}${hm}` });
}
TIMEZONE_OPTIONS.push({ value: "+05:30", label: "UTC +05:30" });
TIMEZONE_OPTIONS.push({ value: "+09:30", label: "UTC +09:30" });
TIMEZONE_OPTIONS.sort((a,b) => {
  // Simple textual sort handles offsets nicely since format is strictly matched
  return a.value.localeCompare(b.value);
});

// Sub-component for individual waypoint items
function SortableWaypointItem({ id, wp, index }: { id: string; wp: Waypoint; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });
  
  const removeWaypoint = useRouteStore((state) => state.removeWaypoint);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm mb-2"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          Point {index + 1}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm("Delete Waypoint: Are you sure you want to remove this point?")) {
            removeWaypoint(id);
          }
        }}
        className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors"
        title="Remove"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { waypoints, reorderWaypoints, setConfig, startDate, startTime, timezoneOffset, paceMinutes, paceSeconds, useNoise, useSpeedUnit,
          snappedPath, generatedActivity, isGenerating, generateActivity,
          activityType, setActivityType, lastGeneratedAt } = useRouteStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [, setIsSearching] = useState(false);
  const flyTo = useRouteStore((state) => state.flyTo);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'StravaFakeRun/1.0',
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        flyTo(parseFloat(lat), parseFloat(lon), 14);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        flyTo(position.coords.latitude, position.coords.longitude, 16);
      },
      (error) => {
        alert("Unable to retrieve your location: " + error.message);
      }
    );
  };

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = waypoints.findIndex((wp) => wp.id === active.id);
      const newIndex = waypoints.findIndex((wp) => wp.id === over.id);
      reorderWaypoints(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-full h-1/2 md:w-96 md:h-full bg-white flex flex-col border-b md:border-r border-gray-200 z-20 shadow-xl overflow-y-auto">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">StravaFakeRun</h1>
        <p className="text-sm text-gray-500 mt-1">Plot your synthetic route</p>
      </div>

      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FC4C02] focus:border-[#FC4C02]"
            />
          </div>
          <button
            type="button"
            onClick={handleLocate}
            title="Go to current location"
            className="p-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Run Settings</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setConfig({ startDate: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setConfig({ startTime: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Timezone Offset</label>
            <select
              value={timezoneOffset}
              onChange={(e) => setConfig({ timezoneOffset: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              {TIMEZONE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-700">Target Effort</label>
              <div className="flex bg-gray-200 rounded-md p-0.5">
                <button 
                  onClick={() => setConfig({ useSpeedUnit: false })}
                  className={`text-[10px] px-2 py-0.5 rounded ${!useSpeedUnit ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500'}`}
                >
                  Pace
                </button>
                <button 
                  onClick={() => setConfig({ useSpeedUnit: true })}
                  className={`text-[10px] px-2 py-0.5 rounded ${useSpeedUnit ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500'}`}
                >
                  Speed
                </button>
              </div>
            </div>
            
            {!useSpeedUnit ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={paceMinutes}
                  onChange={(e) => setConfig({ paceMinutes: parseInt(e.target.value) || 0 })}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-sm text-gray-600">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={paceSeconds}
                  onChange={(e) => setConfig({ paceSeconds: parseInt(e.target.value) || 0 })}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  value={parseFloat((60 / (paceMinutes + paceSeconds / 60)).toFixed(1))}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value);
                    if (speed > 0) {
                      const totalMinutes = 60 / speed;
                      const mins = Math.floor(totalMinutes);
                      const secs = Math.round((totalMinutes - mins) * 60);
                      setConfig({ paceMinutes: mins, paceSeconds: secs });
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-sm text-gray-600">km/h</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Enable Pacing Noise</label>
            <input
              type="checkbox"
              checked={useNoise}
              onChange={(e) => setConfig({ useNoise: e.target.checked })}
              className="accent-[#FC4C02]"
            />
          </div>
        </div>
      </div>

      {/* Activity Type Selector */}
      <div className="px-4 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
        <p className="text-xs font-medium text-zinc-400 mb-2">Activity Type</p>
        <div
          role="radiogroup"
          aria-label="Select activity type"
          className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl"
        >
          {ACTIVITY_OPTIONS.map(({ type, label, icon: Icon }) => {
            const isActive = activityType === type;
            return (
              <button
                key={type}
                role="radio"
                aria-checked={isActive}
                aria-label={type}
                title={type}
                onClick={() => setActivityType(type)}
                className={[
                  'flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg',
                  'text-xs font-medium transition-colors duration-150 ease-in-out cursor-pointer',
                  isActive
                    ? 'bg-[#FC4C02] text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
                ].join(' ')}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Activity</h2>
        <div className="space-y-2 mb-4">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
            {copied ? "Link Copied!" : "Share Route Link"}
          </button>
          <button
            onClick={generateActivity}
            disabled={snappedPath.length < 2 || isGenerating}
            className="w-full py-2 px-4 bg-[#FC4C02] text-white text-sm font-medium rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Activity'}
          </button>
        </div>
        {generatedActivity && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview Charts</span>
            </div>
            <ActivityCharts key={lastGeneratedAt} data={generatedActivity} />
          </div>
        )}
        {generatedActivity !== null && generatedActivity.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 text-center mb-2">
              {generatedActivity.length} points generated
              <span className="ml-2 text-zinc-400">
                · {SPORT_PROFILES[activityType].cadence.unit}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => exportGPX(generatedActivity, activityType)}
                className="flex-1 py-2 px-2 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
              >
                Download GPX
              </button>
              <button
                onClick={() => exportTCX(generatedActivity, activityType)}
                className="flex-1 py-2 px-2 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
              >
                Download TCX
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {waypoints.length === 0 ? (
          <div className="text-center mt-12 p-6">
            <h2 className="text-lg font-semibold text-gray-900">No waypoints yet.</h2>
            <p className="text-sm text-gray-500 mt-2">
              Click anywhere on the map to start drawing your route.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={waypoints.map(wp => wp.id)}
              strategy={verticalListSortingStrategy}
            >
              {waypoints.map((wp, index) => (
                <SortableWaypointItem key={wp.id} id={wp.id} wp={wp} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
