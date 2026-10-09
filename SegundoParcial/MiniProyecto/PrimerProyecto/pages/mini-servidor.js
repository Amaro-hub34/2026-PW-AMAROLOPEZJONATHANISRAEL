import { useEffect, useState } from 'react';

//vamos a consumir un servidor en express

export default function MiniServidor() {
    const [saludo, setSaludo] = useState('');
    const [texto, setTexto] = useState('');
    const [eco, setEco] = useState('');
    const [error, setError] = useState('');
    
    //Dependiendo que haga el usuario va a mandar el dato o el error
    useEffect(() => {
        fetch('/mini/saludo')
        .then((res) => res.json())
        .then((data) => setSaludo(data.mensaje))
        .catch(() => setError('El mini servidor no responde, por favor verificalo'));
        }, []);      

        async function enviarEco(e) {
            e.preventDefault();
            setError('');
            const res = await fromFetch('/mini/eco', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ texto}),
            }); 
            const data = await res.json();
            if (res.ok) {
                setEco(data.eco);
                setTexto('');
            }else {
                setError(`Error: ${data.error}`);
            }
        }
        //Busca el evento, cuando sea verdadero o falso, dependiendo de lo que haga el usuario, va a mandar el dato o el error

        return (
            <main>
                <h1>Mini Servidor Express</h1>
                <h2>Get / SALUDO</h2>
                <p>{saludo}</p>
                <h2>Post / ECO</h2>
                <form onSubmit={enviarEco} value={texto} onChange={(e) => setTexto(e.target.value)}>
                    <button type="submit">Enviar</button>
                </form>
                {eco && <p>El servidor respondió: {eco}</p>}
                {eco && <p className="error">{error}</p>}
            </main>
        );
}