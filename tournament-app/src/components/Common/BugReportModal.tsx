import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaTimes } from 'react-icons/fa';
import {
  Form,
  FormGroup,
  Label,
  Input,
  BugReportModalBackdrop,
  BugReportModalContainer,
  BugReportModalHeader,
  BugReportModalTitle,
  BugReportModalCloseButton,
  BugReportModalTextArea,
  BugReportModalStatusMessage,
} from '../../styles/index';
import Button from './Button';



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
    <BugReportModalBackdrop onClick={onClose}>
      <BugReportModalContainer onClick={(e) => e.stopPropagation()}>
        <BugReportModalHeader>
          <BugReportModalTitle>Report a Bug</BugReportModalTitle>
          <BugReportModalCloseButton onClick={onClose}><FaTimes /></BugReportModalCloseButton>
        </BugReportModalHeader>

        {status === 'success' ? (
          <BugReportModalStatusMessage status="success">Thank you! Your feedback has been submitted.</BugReportModalStatusMessage>
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
              <BugReportModalTextArea id="feedback" name="feedback" value={formData.feedback} onChange={handleChange} />
            </FormGroup>
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Submit Report'}
            </Button>
            {status === 'error' && <BugReportModalStatusMessage status="error">Failed to submit. Please try again.</BugReportModalStatusMessage>}
          </Form>
        )}
      </BugReportModalContainer>
    </BugReportModalBackdrop>
  );
};

export default BugReportModal;
