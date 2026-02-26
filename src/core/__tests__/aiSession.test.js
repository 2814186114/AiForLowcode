import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';

describe('AI Session Management', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        useStore.getState().clearAISession();
    });

    test('should initialize a new AI session', () => {
        const { initAISession, aiSession } = useStore.getState();

        // Initialize session
        initAISession();

        // Verify session was created
        expect(aiSession.id).toBeDefined();
        expect(aiSession.context).toEqual([]);

        // Verify localStorage
        const storedSession = JSON.parse(localStorage.getItem('aiSession'));
        expect(storedSession.id).toEqual(aiSession.id);
        expect(storedSession.context).toEqual([]);
    });

    test('should restore session from localStorage', () => {
        const testSession = {
            id: uuidv4(),
            context: [
                { userInput: 'Create a button', schema: { componentType: 'Button' } }
            ]
        };

        // Set session in localStorage
        localStorage.setItem('aiSession', JSON.stringify(testSession));

        // Initialize session
        const { initAISession, aiSession } = useStore.getState();
        initAISession();

        // Verify restored session
        expect(aiSession.id).toEqual(testSession.id);
        expect(aiSession.context).toEqual(testSession.context);
    });

    test('should update AI context', () => {
        const { initAISession, updateAIContext, aiSession } = useStore.getState();

        // Initialize session
        initAISession();
        const sessionId = aiSession.id;

        // Update context
        const userInput = 'Create a login form';
        const schema = { componentType: 'LoginForm' };
        updateAIContext(userInput, schema);

        // Verify context update
        expect(aiSession.context).toEqual([{ userInput, schema }]);

        // Verify localStorage
        const storedSession = JSON.parse(localStorage.getItem('aiSession'));
        expect(storedSession.context).toEqual([{ userInput, schema }]);

        // Add second context item
        updateAIContext('Add a submit button', { componentType: 'Button' });

        // Verify only last 3 items are kept
        expect(aiSession.context).toHaveLength(2);

        // Add more items to test limit
        updateAIContext('Third item', {});
        updateAIContext('Fourth item', {});

        // Verify only last 3 items are kept
        expect(aiSession.context).toHaveLength(3);
        expect(aiSession.context[0]).toEqual({ userInput: 'Add a submit button', schema: { componentType: 'Button' } });
    });

    test('should clear AI session', () => {
        const { initAISession, updateAIContext, clearAISession, aiSession } = useStore.getState();

        // Initialize and update session
        initAISession();
        updateAIContext('Test input', {});

        // Clear session
        clearAISession();

        // Verify session is cleared
        expect(aiSession.id).toBeNull();
        expect(aiSession.context).toEqual([]);

        // Verify localStorage is cleared
        expect(localStorage.getItem('aiSession')).toBeNull();
    });
});
