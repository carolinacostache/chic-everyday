import { useParams, useNavigate } from "react-router-dom";
import ParticipateContest from "../../components/participateContest/participateContest";

const ContestParticipatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        ← Inapoi
      </button>

      <ParticipateContest pinId={id} />
    </div>
  );
};

export default ContestParticipatePage;