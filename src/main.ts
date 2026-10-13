import { mountChatbot } from './chatbot/widget.ts';
import { startMotion } from './motion/motion.ts';

function start(): void {
  startMotion();
  mountChatbot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
