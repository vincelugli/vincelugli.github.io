import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaTimes } from 'react-icons/fa';
import { Form, FormGroup, Label, Input } from '../../styles/index';
import Button from './Button';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textAlt};
  &:hover { color: ${({ theme }) => theme.text}; }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  min-height: 50px;
  resize: vertical;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const StatusMessage = styled.p<{ status: string }>` /* ... */ `;



interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData = {
  description: '',
  replyTo: '',
  feedback: '',
};

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData(initialFormData);
        setStatus('idle');
      }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert("Please provide a description of the bug.");
      return;
    }
    setStatus('loading');
    
    try {
      const reportData = {
        ...formData,
        submittedAt: Timestamp.now(),
        userAgent: navigator.userAgent,
      };
      await addDoc(collection(db, 'bugReports'), reportData);
      setStatus('success');
      setTimeout(onClose, 2000); // Close modal after 2 seconds on success
    } catch (error) {
      console.error("Failed to submit bug report:", error);
      setStatus('error');
    }
  }, [formData, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Report a Bug</ModalTitle>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </ModalHeader>

        {status === 'success' ? (
          <StatusMessage status="success">Thank you! Your feedback has been submitted.</StatusMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="description">Description of Bug</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="replyTo">Contact Info (Email, Discord, etc.) (Optional)</Label>
              <Input id="replyTo" name="replyTo" type="text" value={formData.replyTo} onChange={handleChange} placeholder="So we can reply to you" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
              <TextArea id="feedback" name="feedback" value={formData.feedback} onChange={handleChange} />
            </FormGroup>
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Submit Report'}
            </Button>
            {status === 'error' && <StatusMessage status="error">Failed to submit. Please try again.</StatusMessage>}
          </Form>
        )}
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default BugReportModal;
