const inviteTemplate = ({ inviteLink, organizationName }) => {
  return `
    <h2>You are invited to join ${organizationName}</h2>

    <p>You have been invited to collaborate on our platform.</p>

    <a href="${inviteLink}" 
       style="padding:12px 20px;background:#4CAF50;color:white;text-decoration:none;">
       Accept Invitation
    </a>

    <p>This invitation will expire in 48 hours.</p>
  `;
};

export default inviteTemplate;