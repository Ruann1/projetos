import { parse, v4 as uuidv4 } from 'uuid';

import styles from './Project.module.css';

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loading from '../layout/Loading';
import Container from '../layout/Container';
import Message from '../layout/Message';
import ProjectForm from '../project/ProjectForm';
import ServiceForm from '../service/ServiceForm';
import ServiceCard from '../service/ServiceCard';

function Project() {
    const { id } = useParams();

    const [project, setProject] = useState({});
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [services, setServices] = useState([]); 
    const [message, setMessage] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/projects/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((resp) => resp.json())
            .then((data) => {
                if (data && data.services) {
                    setProject(data);
                    setServices(data.services);
                } else {
                    setMessage('Projeto não encontrado.');
                    setType('error');
                }
            })
            .catch((err) => {
                console.log(err);
                setMessage('Erro ao carregar o projeto.');
                setType('error');
            });
    }, [id]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    function editPost(project) {
        setMessage('');

        // Validação do orçamento
        if (project.budget < project.cost) {
            setMessage('O orçamento não pode ser menor que o custo do projeto!');
            setType('error');
            return false;
        }

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(data);
                setShowProjectForm(false);
                setMessage('Projeto atualizado!');
                setType('success');
            })
            .catch((err) => console.log(err));
    }

    function CreateService(project) {
        setMessage('');

        if (!project.services || project.services.length === 0) {
            setMessage('Nenhum serviço disponível para adicionar.');
            setType('error');
            return;
        }

        const lastService = project.services[project.services.length - 1];
        lastService.id = uuidv4();

        const lastServiceCost = lastService.cost;
        const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost);

        if (newCost > parseFloat(project.budget)) {
            setMessage('Orçamento ultrapassado, verifique o valor do serviço.');
            setType('error');
            project.services.pop();
            return;
        }

        project.cost = newCost;

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setShowServiceForm(false);
                setProject(data);
                setServices(data.services);
                setMessage('Serviço adicionado com sucesso!');
                setType('success');
            })
            .catch((err) => {
                console.error(err);
                setMessage('Erro ao adicionar o serviço.');
                setType('error');
            });
    }

    function removeService(id, cost) {
       
        const servicesUpdated = project.services.filter(
            (service) => service.id !== id
        );
    
       
        const projectUpdated = {
            ...project,
            services: servicesUpdated,
            cost: parseFloat(project.cost) - parseFloat(cost),
        };
    
     
        fetch(`http://localhost:5000/projects/${projectUpdated.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectUpdated),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(data); 
                setServices(servicesUpdated); 
                setMessage('Serviço removido com sucesso!');
                setType('success');
            })
            .catch((err) => {
                console.error(err);
                setMessage('Erro ao remover o serviço.');
                setType('error');
            });
    }
    

    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm);
    }

    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm);
    }

    return (
        <>
            {project.name ? (
                <div className={styles.project_details}>
                    <Container customClass="column">
                        {message && <Message type={type} msg={message} />}
                        <div className={styles.details_container}>
                            <h1>Projeto: {project.name}</h1>
                            <button
                                className={styles.btn}
                                onClick={toggleProjectForm}
                            >
                                {!showProjectForm
                                    ? 'Editar projeto'
                                    : 'Fechar'}
                            </button>
                            {!showProjectForm ? (
                                <div className={styles.project_info}>
                                    <p>
                                        <span>Categoria: </span>{' '}
                                        {project.category.name}
                                    </p>
                                    <p>
                                        <span>Total de Orçamento: </span> R$
                                        {project.budget}
                                    </p>
                                    <p>
                                        <span>Total Utilizado: </span> R$
                                        {project.cost}
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.project_info}>
                                    <ProjectForm
                                        handleSubmit={editPost}
                                        btnText="Concluir edição"
                                        projectData={project}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.service_form_container}>
                            <h2>Adicione um serviço:</h2>
                            <button
                                className={styles.btn}
                                onClick={toggleServiceForm}
                            >
                                {!showServiceForm
                                    ? 'Adicionar serviço'
                                    : 'Fechar'}
                            </button>
                            <div className={styles.project_info}>
                                {showServiceForm && (
                                    <ServiceForm
                                        handleSubmit={CreateService}
                                        btnText="Adicionar Serviço"
                                        projectData={project}
                                    />
                                )}
                            </div>
                        </div>
                        <h2>Serviços</h2>
                        <Container customClass="start">
                            {services.length > 0 &&
                                services.map((service) => (
                                    <ServiceCard
                                    id={service.id}
                                    name={service.name}
                                    cost={service.cost}
                                    description={service.description}
                                    key={service.id}
                                    handleRemove={() => removeService(service.id, service.cost)}
                                />
                                
                                ))}
                            {services.length === 0 && (
                                <p>Não há serviços cadastrados.</p>
                            )}
                        </Container>
                    </Container>
                </div>
            ) : (
                <Loading />
            )}
        </>
    );
}

export default Project;