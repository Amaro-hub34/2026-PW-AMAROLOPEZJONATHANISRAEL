import { useRouter } from 'next/router';

export default function Practica() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <main>
            <h1>Ruta dinamica de practica</h1>
            <p>El parametro capturado por Next es : {id}</p>
        </main>
    );
}