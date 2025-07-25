// src/pages/admin/ContactMessagesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table } from 'react-bootstrap';
import adminService from '../../services/admin.service';
import loggingService from '../../services/logging.service';
import Swal from 'sweetalert2';

const ContactMessagesPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch contact messages from the backend
    const fetchContacts = useCallback(async () => {
        setLoading(true);
        setError(null);
        loggingService.info('ContactMessagesPage: Fetching all contact messages.');
        try {
            const response = await adminService.getAllContacts();
            setContacts(response);
            loggingService.info('ContactMessagesPage: Successfully fetched contact messages.', { count: response.length });
        } catch (err) {
            console.error('ContactMessagesPage: Error fetching contact messages:', err);
            const errorMessage = err.message || 'Failed to fetch contact messages. Please try again.';
            setError(errorMessage);
            Swal.fire({
                icon: 'error',
                title: 'Error Fetching Messages',
                text: errorMessage,
            });
            loggingService.error('ContactMessagesPage: Failed to fetch contact messages', { errorMessage, errorStack: err.stack });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    return (
        <Container fluid className="p-0">
            <h2 className="mb-4 text-primary fw-bold">Website Contact Messages</h2>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading messages...</span>
                    </Spinner>
                    <p className="ms-3 text-muted">Loading contact messages...</p>
                </div>
            ) : error ? (
                <Alert variant="danger" className="text-center">
                    {error}
                </Alert>
            ) : contacts.length === 0 ? (
                <Alert variant="info" className="text-center">
                    No contact messages found.
                </Alert>
            ) : (
                <Card className="shadow-sm rounded-3">
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover className="mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile Number</th> {/* Corrected: Header for mobile */}
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact) => (
                                        <tr key={contact.id}>
                                            <td>{contact.id}</td>
                                            <td>{contact.name}</td>
                                            <td>{contact.email}</td>
                                            <td>{contact.mobile}</td> {/* Corrected: Displaying mobile number */}
                                            <td>{contact.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default ContactMessagesPage;
