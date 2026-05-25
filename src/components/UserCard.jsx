function UserCard({ user }) {
  return (
    <section className="card">
      <div className="card-inner">
        <img className="avatar" src={user.avatar_url} alt={`${user.login} avatar`} />

        <div className="user-info">
          <div>
            <h2>{user.name || 'No name available'}</h2>
            <p className="badge">@{user.login}</p>
          </div>

          {user.bio && <p>{user.bio}</p>}

          <div className="badge">
            <span>{user.location || 'Location not available'}</span>
            {user.blog && (
              <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer">
                Blog
              </a>
            )}
            <a href={user.html_url} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>{user.followers}</strong>
              Followers
            </div>
            <div className="stat">
              <strong>{user.following}</strong>
              Following
            </div>
            <div className="stat">
              <strong>{user.public_repos}</strong>
              Repos
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserCard
