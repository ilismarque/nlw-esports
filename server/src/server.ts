import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { convertHoursStringToMinutes } from "./utils/convert-hours-string-to-minutes";
import { convertMinutesToHoursString } from "./utils/convert-minutes-to-hour-string";

const app = express();

app.use(express.json());
app.use(cors());

//Inicializando o prisma
const prisma = new PrismaClient({
    log: ["query"],
});

/**
 * Query parameters => filtros, ordenação, paginação (persistir estado)
 * sempre nomear
 * http://localhost:3000/?name=John&age=30
 * 
 * Route parameters => identificar recursos (atualizar ou deletar)
 * http://localhost:3000/users/1
 * 
 * Request body => conteúdo na hora de criar ou editar um recurso
 *
 */

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: { select: { ads: true } },
        }
    });

    return response.json(games);
});

//passando o id do game como parametro, já cria o ad relacionado
app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            weekDays: body.weekDays.join(','),
            hourStart: convertHoursStringToMinutes(body.hourStart),
            hourEnd: convertHoursStringToMinutes(body.hourEnd),
            discord: body.discord,
            useVoiceChannel: body.useVoiceChannel
        }
    });
    return response.status(201).json(ad);
});

// listar anuncios de um game especifico
app.get('/games/:id/ads', async (request, response) => {

    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true
        },
        where: {
            gameId
        },
        orderBy: {
            createAt: 'desc'
        }
    });

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHoursString(ad.hourStart),
            hourEnd: convertMinutesToHoursString(ad.hourEnd)
        }
    }
    ));
});

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const discord = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: String(adId)
        }
    });
    return response.json(discord);


});

//Fica ouvindo a porta
app.listen(3333)