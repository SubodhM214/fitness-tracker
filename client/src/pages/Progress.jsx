import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { getHeatmapData } from "../api/log.api";
import { uploadPhoto, getProgress, deletePhoto } from "../api/progress.api";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";

function Progress() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [weight, setWeight] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchHeatmap();
    fetchPhotos();
  }, []);

  const fetchHeatmap = async () => {
    try {
      const res = await getHeatmapData();
      setHeatmapData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await getProgress();
      setPhotos(res.data);
    } catch (err) {
      toast.error("Failed to load photos");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a photo first");
      return;
    }
    const formData = new FormData();
    formData.append("photo", file);
    if (note) formData.append("note", note);
    if (weight) formData.append("weight", weight);
    setUploading(true);
    try {
      await uploadPhoto(formData);
      toast.success("Photo uploaded!");
      setFile(null);
      setPreview(null);
      setNote("");
      setWeight("");
      fetchPhotos();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePhoto(id);
      setPhotos(photos.filter((p) => p._id !== id));
      toast.success("Photo deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Toaster position="top-center" />

      {/* topbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <h1 className="font-semibold text-gray-900 dark:text-white">
          Progress
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Activity — last 90 days
          </h2>
          <CalendarHeatmap
            startDate={startDate}
            endDate={new Date()}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || value.count === 0) return "color-empty";
              if (value.count === 1) return "color-scale-1";
              if (value.count === 2) return "color-scale-2";
              return "color-scale-3";
            }}
          />
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Less
            </span>
            {[
              "bg-gray-100 dark:bg-gray-700",
              "bg-purple-200 dark:bg-purple-800",
              "bg-purple-400",
              "bg-purple-700",
            ].map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              More
            </span>
          </div>
        </div>

        {/* upload */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Upload today's photo
          </h2>
          <label className="block">
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
              ${
                preview
                  ? "border-purple-300 dark:border-purple-600"
                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <>
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tap to choose photo
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    JPG, PNG or WebP
                  </div>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="number"
              placeholder="kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-16 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="mt-3 w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            {uploading ? "Uploading..." : "Upload photo"}
          </button>
        </div>

        {/* photo gallery */}
        {photos.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Progress photos ({photos.length})
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-600"
                >
                  <img
                    src={photo.photoUrl}
                    alt="Progress"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 bg-opacity-90 px-2 py-1">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {new Date(photo.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    {photo.weight && (
                      <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                        {photo.weight}kg
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No progress photos yet. Upload your first one!
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}

export default Progress;
