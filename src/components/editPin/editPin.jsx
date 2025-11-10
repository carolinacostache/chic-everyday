import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiRequest from '../../utils/apiRequest';
import './editPin.css';

const weatherTags = [
  "rainy", "sunny", "winter", "summer", "cloudy", "foggy"
];

const updatePinRequest = async ({ pinId, data }) => {
  const res = await apiRequest.patch(`/pins/${pinId}`, data);
  return res.data;
};

const EditPin = ({ pin, onClose }) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(pin.title);
  const [description, setDescription] = useState(pin.description);
  
  const [selectedWeatherTags, setSelectedWeatherTags] = useState(
    pin.tags.filter(tag => weatherTags.includes(tag))
  );
  const [customTags, setCustomTags] = useState(
    pin.tags.filter(tag => !weatherTags.includes(tag)).join(', ')
  );

  const mutation = useMutation({
    mutationFn: updatePinRequest,
    onSuccess: (updatedPin) => {
      queryClient.invalidateQueries({ queryKey: ["pin", pin._id] });
      onClose();
    },
    onError: (err) => {
      alert("Actualizarea a eșuat: " + err.response?.data?.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customTagsArray = customTags.split(",").map(t => t.trim()).filter(Boolean);
    const allTags = [...selectedWeatherTags, ...customTagsArray];

    if (selectedWeatherTags.length === 0) {
      alert("Vă rugăm selectați cel puțin un tag de vreme.");
      return;
    }

    mutation.mutate({
      pinId: pin._id,
      data: {
        title,
        description,
        tags: allTags.join(','),
      }
    });
  };

  const handleWeatherTagChange = (tag) => {
    setSelectedWeatherTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  return (
    <div className="editModalOverlay" onClick={onClose}>
      <div className="editModalContent" onClick={(e) => e.stopPropagation()}>
        <div className="editModalHeader">
          <h1>Editează acest Pin</h1>
          <button className="closeButton" onClick={onClose}>X</button>
        </div>
        <form className="editForm" onSubmit={handleSubmit}>
          
          <div className="formGroup">
            <label htmlFor="title">Titlu</label>
            <input 
              type="text" 
              id="title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label htmlFor="description">Descriere</label>
            <textarea 
              id="description"
              rows={5}
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Tag-uri de Vreme (Obligatoriu)</label>
            <div className="tagContainer">
              {weatherTags.map((tag) => (
                <div 
                  key={tag} 
                  className={`tagItem ${selectedWeatherTags.includes(tag) ? "selected" : ""}`}
                  onClick={() => handleWeatherTagChange(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="customTags">Tag-uri personalizate</label>
            <input 
              type="text" 
              id="customTags"
              value={customTags} 
              onChange={(e) => setCustomTags(e.target.value)}
              placeholder="design, art, etc."
            />
          </div>

          <button type="submit" className="saveButton" disabled={mutation.isPending}>
            {mutation.isPending ? "Se salvează..." : "Salvează"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPin;