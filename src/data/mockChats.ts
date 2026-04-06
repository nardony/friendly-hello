export interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

export const mockChats: Chat[] = [
  {
    id: "1",
    name: "Ana Silva",
    avatar: "AS",
    lastMessage: "Vamos almoçar amanhã? 🍕",
    time: "14:32",
    unread: 2,
    online: true,
    messages: [
      { id: "m1", text: "Oi, tudo bem?", time: "14:20", sent: false },
      { id: "m2", text: "Tudo sim! E você?", time: "14:21", sent: true },
      { id: "m3", text: "Tudo ótimo! Tava pensando em combinar algo", time: "14:25", sent: false },
      { id: "m4", text: "Claro, o que tem em mente?", time: "14:28", sent: true },
      { id: "m5", text: "Vamos almoçar amanhã? 🍕", time: "14:32", sent: false },
    ],
  },
  {
    id: "2",
    name: "Grupo da Família",
    avatar: "GF",
    lastMessage: "Mãe: Quem vem no domingo?",
    time: "13:15",
    unread: 5,
    online: false,
    messages: [
      { id: "m1", text: "Gente, vamos combinar o almoço de domingo", time: "12:00", sent: false },
      { id: "m2", text: "Eu vou sim!", time: "12:15", sent: true },
      { id: "m3", text: "Quem vem no domingo?", time: "13:15", sent: false },
    ],
  },
  {
    id: "3",
    name: "Carlos Mendes",
    avatar: "CM",
    lastMessage: "O projeto ficou incrível!",
    time: "12:45",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "E aí, terminou o projeto?", time: "12:30", sent: true },
      { id: "m2", text: "Sim! Acabei de enviar", time: "12:40", sent: false },
      { id: "m3", text: "O projeto ficou incrível!", time: "12:45", sent: false },
    ],
  },
  {
    id: "4",
    name: "Maria Costa",
    avatar: "MC",
    lastMessage: "Obrigada pela ajuda! 💛",
    time: "Ontem",
    unread: 0,
    online: false,
    messages: [
      { id: "m1", text: "Consegui resolver aquele problema!", time: "18:00", sent: false },
      { id: "m2", text: "Que bom! Sabia que ia conseguir", time: "18:05", sent: true },
      { id: "m3", text: "Obrigada pela ajuda! 💛", time: "18:10", sent: false },
    ],
  },
  {
    id: "5",
    name: "Pedro Souza",
    avatar: "PS",
    lastMessage: "Vou mandar o link agora",
    time: "Ontem",
    unread: 0,
    online: false,
    messages: [
      { id: "m1", text: "Tem o link daquele site?", time: "16:00", sent: true },
      { id: "m2", text: "Vou mandar o link agora", time: "16:30", sent: false },
    ],
  },
];
