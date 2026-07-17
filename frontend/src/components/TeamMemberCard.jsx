export default function TeamMemberCard({ member, ownerId }) {
  return <article className="team-member-card"><div className="member-avatar">{`${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`}</div><div><strong>{member.firstName} {member.lastName}</strong>{String(member._id) === String(ownerId) && <span className="project-status">Owner</span>}<p>{member.developerRole || "Developer"}</p><div className="user-card-interests">{member.skills?.slice(0, 4).map((skill) => <span className="interest-tag" key={skill}>{skill}</span>)}</div></div></article>;
}
