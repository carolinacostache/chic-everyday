import { useParams, useNavigate } from "react-router-dom";
import ParticipateContest from "../../components/participateContest/participateContest";

const ContestParticipatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="pcPageWrapper">
      <button className="pcBackButton" onClick={() => navigate(-1)}>
        ← Înapoi
      </button>

      <ParticipateContest pinId={id} />
    </div>
  );
};

export default ContestParticipatePage;
