import { GraphQLClient } from 'graphql-request';


import { createProjectMutation, createUserMutation, getAllProjectsQuery, getProjectByIdQuery, getProjectsOfUserQuery, getUserQuery, projectsQuery } from '@/graphql';
import { ProjectForm } from '@/common.types';

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_URL || '' : 'http://127.0.0.1:4000/graphql';
const apiKey = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || '' : 'letmein';
const serverUrl = isProduction ? process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:3000';

const client = new GraphQLClient(apiUrl);

export const fetchToken = async () => {
    try {
        const response = await fetch(`${serverUrl}/api/auth/token`);
        return response.json();
    } catch (err) {
        throw err;
    }
};

export const uploadImage = async (imagePath: string) => {
    try {
        const response = await fetch(`${serverUrl}/api/upload`, {
            method: 'POST',
            body: JSON.stringify({
                path: imagePath,
            }),
        });
        return response.json();
    } catch (err) {
        throw err;
    }
};

const makeGraphQLRequest = async (query: string, variables = {}) => {
    try {
        return await client.request(query, variables);
    } catch (err) {
        throw err;
    }
};

export const fetchAllProjects = async (category?: string | null, endcursor?: string | null) => {
    client.setHeader("x-api-key", apiKey);

    const variables = category ? { category, endcursor } : { endcursor }

    return category ? makeGraphQLRequest(projectsQuery, variables) : makeGraphQLRequest(getAllProjectsQuery, variables);
};

export const createNewProject = async (form: ProjectForm, creatorId: string, token: string) => {
    const imageUrl = await uploadImage(form.image);

    if (imageUrl.url) {
        client.setHeader("Authorization", `Bearer ${token}`);

        const variables = {
            input: {
                ...form,
                image: imageUrl.url,
                createdBy: {
                    link: creatorId
                }
            }
        };

        return makeGraphQLRequest(createProjectMutation, variables);
    }
};
































export const getProjectDetails = (id: string) => {
    client.setHeader('x-api-key', apiKey);
    try {
        return makeGraphQLRequest(getProjectByIdQuery, { id });
    } catch (err) {
        throw err;
    }
};

export const getUserProjects = (id: string, last?: number) => {
    client.setHeader('x-api-key', apiKey);
    try {
        return makeGraphQLRequest(getProjectsOfUserQuery, { id, last });
    } catch (err) {
        throw err;
    }
};

export const createUser = (name: string, email: string, avatarUrl: string) => {
    client.setHeader('x-api-key', apiKey);

    const variables = {
        input: {
            name: name,
            email: email,
            avatarUrl: avatarUrl
        },
    };

    return makeGraphQLRequest(createUserMutation, variables);
};






export const getUser = (email: string) => {
    client.setHeader('x-api-key', apiKey);
    return makeGraphQLRequest(getUserQuery, { email });
};