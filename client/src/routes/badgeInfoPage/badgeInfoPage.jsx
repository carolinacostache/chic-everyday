import React from 'react';
import { BADGES, ACTION_POINTS, LEVEL_THRESHOLDS } from '../../utils/gamificationRules';
import './badgeInfoPage.css';

const BadgesInfoPage = () => {
  return (
    <div className="badgesInfoPage">
      <h1>Sistemul de Fashion Points 🏆</h1>
      <p>Fii activ în comunitatea ChicEveryday și urcă în clasament!</p>

      <section>
        <h2>Cum câștigi puncte?</h2>
        <ul>
          <li><strong>Autentificare zilnică:</strong> {ACTION_POINTS.DAILY_LOGIN} puncte </li>
          <li><strong>Participare la concurs:</strong> {ACTION_POINTS.CONTEST_JOIN} puncte </li>
          <li><strong>Postare în concurs:</strong> {ACTION_POINTS.CONTEST_POST} puncte </li>
        </ul>
      </section>

      <section>
        <h2>Insigne (Badges) pe care le poți colecționa</h2>
        <div className="badgesGrid">
          {BADGES.map(badge => (
            <div key={badge.key} className="infoBadgeCard">
  <span className="infoBadgeIcon">{badge.icon}</span>
  <h3>{badge.name}</h3>
  <p className="badgeCondition">
    {badge.key === "first_points" && "Câștigă primele 10 puncte."}
    {badge.key === "contest_joiner" && "Participă la cel puțin un concurs."}
    {badge.key === "level_3" && "Atinge nivelul 3 de experiență."}
  </p>
</div>
          ))}
        </div>
      </section>

      <section>
        <h2>Niveluri</h2>
        <div className="levelsList">
          {LEVEL_THRESHOLDS.map((points, index) => (
            <div key={index} className="levelRow">
              <span>Nivel {index + 1}</span>
              <span>{points} Fashion Points </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BadgesInfoPage;