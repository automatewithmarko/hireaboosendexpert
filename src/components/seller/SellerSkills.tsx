export function SellerSkills({ skills }: { skills: string[] }) {
  return (
    <div className="provider-section">
      <h3>Skills</h3>
      <div className="provider-skills">
        {skills.map((skill) => (
          <span key={skill} className="provider-skill">{skill}</span>
        ))}
      </div>
    </div>
  );
}
