import { useParams } from "react-router-dom";
import { defaultData } from "../data/defaultData";
import type { Role } from "../types/types";
import './SharedStyles.css';

export default function RoleDetailPage() {
  const { professionId } = useParams<{ professionId: string }>();
  const roles = defaultData.roles.filter(
    (role) => role.professionId === Number(professionId)
  );

  return (
    <div className="role-detail-container">
      <h1>Roles in this Profession</h1>

      {roles.map((role: Role) => (
        <div key={role.id} className="role-card">
          <h2>{role.title}</h2>
          {role.description && <p>{role.description}</p>}

          {role.requiredSkills && (
            <div>
              <h4>Required Skills</h4>
              <ul>
                {role.requiredSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {role.companies && (
            <div>
              <h4>Companies Hiring</h4>
              <ul>
                {role.companies.map((company) => (
                  <li key={company}>{company}</li>
                ))}
              </ul>
            </div>
          )}

          {role.salaryRange && (
            <p>
              <strong>Salary Range:</strong> {role.salaryRange}
            </p>
          )}

          {role.educationLevel && (
            <p>
              <strong>Education Level:</strong> {role.educationLevel}
            </p>
          )}

          <div className="button-group">
            <button className="action-button">Apply</button>
            <button className="action-button">Bookmark</button>
            <button className="action-button">Shadow</button>
          </div>
        </div>
      ))}
    </div>
  );
}