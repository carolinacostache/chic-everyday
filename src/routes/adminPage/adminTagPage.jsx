import { useState, useEffect } from "react"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminTagPage.css";
import { useSearchParams } from "react-router-dom";

const AdminTagsPage = () => {
  const queryClient = useQueryClient();
  const [newWeatherTag, setNewWeatherTag] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(urlSearch);

  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  const triggerSearch = () => {
    if (localSearch === urlSearch) return;

    if (localSearch.trim()) {
      setSearchParams({ search: localSearch });
    } else {
      setSearchParams({});
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      triggerSearch();
    }
  };

  const handleBlur = () => {
    triggerSearch(); 
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminTags", urlSearch], 
    queryFn: () => apiRequest.get(`/admin/tags?search=${urlSearch}`).then((res) => res.data),
  });

  const addMutation = useMutation({
    mutationFn: (name) => apiRequest.post("/admin/tags/weather", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminTags"]);
      setNewWeatherTag("");
    },
    onError: (err) => alert(err.response?.data?.message),
  });

  const deleteWeatherMutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/admin/tags/weather/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["adminTags"]),
  });

  const deleteUserTagMutation = useMutation({
    mutationFn: (tagName) => apiRequest.put("/admin/tags/user/delete", { tagName }),
    onSuccess: () => queryClient.invalidateQueries(["adminTags"]),
  });

  const handleAddWeather = (e) => {
    e.preventDefault();
    if (newWeatherTag.trim()) addMutation.mutate(newWeatherTag);
  };

  const handleDeleteUserTag = (tagName) => {
    if (confirm(`Sigur vrei să ștergi tag-ul "${tagName}" din TOATE postările?`)) {
      deleteUserTagMutation.mutate(tagName);
    }
  };

  if (isLoading) return <div>Loading tags...</div>;
  if (error) return <div>Error loading tags.</div>;

  return (
    <div className="adminPage adminTagsContainer">
      <h1>Moderare Tag-uri</h1>

      <div className="tagsGrid">
        <div className="tagsColumn weatherColumn">
          <h2>Tag-uri Meteo (Obligatorii)</h2>
          <p className="infoText">Acestea apar în formularul de creare.</p>
          
          <form onSubmit={handleAddWeather} className="addTagForm">
            <input 
              type="text" 
              placeholder="Tag nou (ex: windy)" 
              value={newWeatherTag}
              onChange={(e) => setNewWeatherTag(e.target.value)}
            />
            <button type="submit" disabled={addMutation.isPending}>Adaugă</button>
          </form>

          <div className="tagsList">
            {data.weatherTags.map((tag) => (
              <div key={tag._id} className="tagRow">
                <span className="tagBadge weather">{tag.name}</span>
                <button 
                  className="deleteIconBtn"
                  onClick={() => deleteWeatherMutation.mutate(tag._id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="tagsColumn userColumn">
          <div className="columnHeader">
            <h2>Tag-uri Utilizatori</h2>
            <p className="infoText">Cele mai folosite tag-uri din comunitate.</p>
          </div>

          <input 
            type="text" 
            placeholder="Scrie și apasă ENTER..." 
            
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            
            onKeyDown={handleKeyDown} 
            onBlur={handleBlur}
            
            className="localSearchInput"
          />

          <div className="tagsList scrollable">
            {data.userTags.map((tag) => (
              <div key={tag._id} className="tagRow">
                <div className="tagInfo">
                  <span className="tagBadge user">#{tag._id}</span>
                  <span className="tagCount">{tag.count} postări</span>
                </div>
                <button 
                  className="deleteTextBtn"
                  onClick={() => handleDeleteUserTag(tag._id)}
                >
                  Șterge Tot
                </button>
              </div>
            ))}
            {data.userTags.length === 0 && <p style={{color: '#888'}}>Niciun tag găsit.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTagsPage;