import { useNavigate, useParams } from "react-router-dom";
import { LayoutBaseDePagina } from "../../shared/layouts";
import { FerramentasDeDetalhe } from "../../shared/components";
import { useEffect, useState } from "react";
import { PessoasService } from "../../shared/services/api/pessoas/PessoasService";
import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import { VTextField, VForm, useVForm, IVFormErrors } from "../../shared/forms";
import * as yup from 'yup';
import { AutoCompleteFuncoes } from "./components/AutoCompleteFuncoes";
import { VTextArea } from "../../shared/forms/VTextArea";

interface IFormData {
    email: string;
    funcaoId: number;
    nomeCompleto: string;
    informacoes: string;
}

const formValidationSchema: yup.Schema<IFormData> = yup.object().shape({
    funcaoId: yup.number().required(),
    email: yup.string().required().email(),
    nomeCompleto: yup.string().required().min(3),
    informacoes: yup.string().required()
});

export const DetalheDePessoas: React.FC = () =>{
    const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
    const { id = 'nova' } = useParams<'id'>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [nome, setNome] = useState('');

    useEffect(() => {
        if (id !== 'nova') {
            setIsLoading(true);
            
            PessoasService.getById(Number(id))
            .then((result) => {
                setIsLoading(false);

                if (result instanceof Error) {
                    alert(result.message);
                    navigate('/pessoas');                    
                } else {
                    setNome(result.nomeCompleto);

                    formRef.current?.setData(result);
                }
            });
            
        } else {
            formRef.current?.setData({
                email: '',
                funcaoId: undefined,
                nomeCompleto: '',
                informacoes: ''
            });
        }
    }, [id]);

    const handleSave = (dados: IFormData) => {

        formValidationSchema
        .validate(dados, { abortEarly: false })
        .then((dadosValidados) => {
            setIsLoading(true);

        if (id === 'nova') {
            PessoasService.create(dadosValidados)
            .then((result) => {
                setIsLoading(false);

                if(result instanceof Error) {
                    alert(result.message);
                } else {
                    if (isSaveAndClose()) {
                        navigate('/pessoas');
                    } else {
                        navigate(`/pessoas/detalhe/${result}`);
                    }
                }
            })
        } else {
            PessoasService.updateById(Number(id), { id: Number(id), ...dadosValidados})
            .then((result) => {
                setIsLoading(false);
                
                if(result instanceof Error) {
                    alert(result.message);
                } else {
                    if (isSaveAndClose()) {
                        navigate('/pessoas');
                    }
                } 
            });
        }
        }).catch((errors: yup.ValidationError) => {
            const validationErrors: IVFormErrors = {};

            errors.inner.forEach(error => {
                if (!error.path) return;
                
                validationErrors[error.path] = error.message;                
            });
            formRef.current?.setErrors(validationErrors);
        });
    }

    const handleDelete = (id: number) => {
        if (confirm('Realmente deseja apagar?')) {
            PessoasService.deleteById(id)
            .then(result => {
                if (result instanceof Error) {
                    alert(result.message);
                } else {
                    alert("Registro apagado com sucesso!")
                    navigate('/pessoas');
                }
            });            
        }
    }

    return(
        <LayoutBaseDePagina
        titulo={id === 'nova' ? 'Nova Pessoa' : nome}
        barraDeFerramentas={
            <FerramentasDeDetalhe 
                textoBotaoNovo="Nova"
                mostrarBotaoSalvarEFechar
                mostrarBotaoNovo = {id !== 'nova'}
                mostrarBotaoApagar = {id !== 'nova'}

                aoClicarEmSalvar={save}
                aoClicarEmSalvarEFechar={saveAndClose}
                aoClicarEmApagar={() => handleDelete(Number(id))}
                aoClicarEmVoltar={() => navigate('/pessoas')}
                aoClicarEmNovo={() => navigate('/pessoas/detalhe/nova')}
            />
        }>

            {isLoading && (
                <LinearProgress variant="indeterminate" />
            )}

            <VForm ref={formRef} onSubmit={handleSave} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">

                    <Grid container direction="column" padding={2} spacing={2}>

                    {isLoading && (
                        <Grid item>
                            <LinearProgress variant="indeterminate" />
                        </Grid>
                    )}

                        <Grid item>
                           <Typography variant="h6">Geral</Typography> 
                        </Grid>

                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2} >
                            <VTextField 
                            onChange={e => setNome(e.target.value)} 
                            disabled={isLoading} 
                            fullWidth 
                            label="Nome Completo" 
                            name="nomeCompleto" 
                            />     
                            </Grid>
                        </Grid>
                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                            <VTextField 
                                disabled={isLoading} 
                                fullWidth 
                                label="Email institucional" 
                                name="email" 
                                />                
                            </Grid>
                        </Grid>
                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                                <AutoCompleteFuncoes
                                    isExternalLoading={isLoading}
                                    />
                            </Grid>
                        </Grid>
                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                            <VTextArea 
                                disabled={isLoading} 
                                fullWidth 
                                label="Informacões" 
                                name="informacoes" 
                                />                
                            </Grid>
                        </Grid>
                        
                    </Grid>               
                    
                </Box>
            </VForm>

        </LayoutBaseDePagina>
    );
}