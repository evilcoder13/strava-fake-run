"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { Trash2, GripVertical } from "lucide-react";
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
  const { waypoints, reorderWaypoints } = useRouteStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = waypoints.findIndex((wp) => wp.id === active.id);
      const newIndex = waypoints.findIndex((wp) => wp.id === over.id);
      reorderWaypoints(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-full h-48 md:w-96 md:h-full bg-gray-50 flex flex-col border-b md:border-r border-gray-200">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">StravaFakeRun</h1>
        <p className="text-sm text-gray-500 mt-1">Plot your synthetic route</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
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
