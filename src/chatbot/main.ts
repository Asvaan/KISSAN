import { mountChatbot } from './widget.ts';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountChatbot, { once: true });
} else {
  mountChatbot();
}
