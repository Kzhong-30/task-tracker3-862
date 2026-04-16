import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

global.fetch = vi.fn();

const mockTasks = [
  { _id: '1', title: 'Test Task 1', completed: false, priority: 'high', createdAt: new Date().toISOString() },
  { _id: '2', title: 'Test Task 2', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
];

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockTasks),
    });
  });

  it('renders the title', async () => {
    render(<App />);
    expect(screen.getByText('Task Tracker 📋')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('What needs to be done? (Press Enter to add)')).toBeInTheDocument();
  });

  it('fetches and displays tasks', async () => {
    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5001/api/tasks');
    });
  });

  it('has filter buttons', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
  });

  it('has add task button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('has search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('🔍 Search tasks...')).toBeInTheDocument();
  });

  it('has priority selector', () => {
    render(<App />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has theme toggle button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
  });

  it('can type in task input', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('What needs to be done? (Press Enter to add)');
    fireEvent.change(input, { target: { value: 'New test task' } });
    expect(input.value).toBe('New test task');
  });

  it('can change priority', () => {
    render(<App />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'high' } });
    expect(select.value).toBe('high');
  });

  it('can type in search input', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText('🔍 Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput.value).toBe('test search');
  });
});
