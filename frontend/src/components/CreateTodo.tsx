import { useState } from 'react';
import { useApi } from '../hooks/useApi';

export const CreateTodo = () => {
    const [title, setTitle] = useState('');
    const { secureFetch } = useApi();

    const handleSubmit = async () => {
        const res = await secureFetch('/api/todos', {
            method: 'POST',
            body: JSON.stringify({ title }),
        });

        if (res.ok) {
            console.log("Todo created! The worker will handle the rest.");
            setTitle('');
        }
    };

    return (
        <div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <button onClick={handleSubmit}>Add Todo</button>
        </div>
    );
};