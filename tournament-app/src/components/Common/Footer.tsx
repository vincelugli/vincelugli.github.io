import { useState } from 'react';
import { CopyrightText, BugReportButton, FooterContainer } from '../../styles';
import BugReportModal from './BugReportModal';
import { FaBug } from 'react-icons/fa';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <FooterContainer>
        <CopyrightText>&copy; 2024 Vince Lugli. All rights reserved. This competition is not affiliated with or sponsored by Riot Games, Inc. or League of Legends Esports.</CopyrightText>
        
        {/* 3. Add the button and its onClick handler */}
        <BugReportButton onClick={() => setIsModalOpen(true)}>
          <FaBug />
          Report a Bug
        </BugReportButton>
      </FooterContainer>
      
      {/* 4. Render the modal and pass it the state and close function */}
      <BugReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Footer;
