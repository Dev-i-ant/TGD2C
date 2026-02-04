export type Language = 'ru' | 'en';

export const translations = {
    ru: {
        common: {
            bp: 'BP',
            status_online: 'Статус: Онлайн',
            loading: 'Загрузка',
            open: 'Открыть',
            close: 'Закрыть',
            soon: 'Скоро',
            processing: 'Обработка',
            error: 'Ошибка',
            confirm: 'Подтвердить',
            sell: 'Продать',
            back: 'Назад',
            success: 'Успешно',
            cancel: 'Отмена'
        },
        nav: {
            home: 'Главная',
            cases: 'Магазин',
            friends: 'Друзья',
            profile: 'Профиль',
            tasks: 'Задания',
            leaderboard: 'Рейтинг'
        },
        home: {
            network_balance: 'Сетевой баланс',
            view_transactions: 'История транзакций',
            recommended: 'Рекомендуемое'
        },
        profile: {
            title: 'Профиль',
            collector: 'Dota 2 Коллекционер',
            best_drop: 'Лучший дроп',
            share_record: 'Поделиться рекордом',
            balance_bp: 'Баланс (BP)',
            inventory: 'Инвентарь',
            settings: 'Настройки',
            admin: 'Админ-панель',
            share_text: 'Смотри, какой дроп мне выпал в Dota 2 Mini App! 🎁',
            theme: 'Тема оформления',
            total_opened: 'Всего открыто',
            earned_bp: 'Заработано BP',
            personal_stats: 'Личная статистика'
        },
        inventory: {
            title: 'Инвентарь',
            empty_title: 'Инвентарь пуст',
            empty_desc: 'Открой свой первый кейс!',
            sell_item: 'Продать предмет',
            withdraw: 'Вывести в Steam',
            sell_all_button: 'Продать всё',
            mass_sell_confirm_title: 'Подтверждение продажи',
            mass_sell_confirm_desc: 'Вы собираетесь продать все предметы в наличии ({count} шт.) на общую сумму:',
            empty_in_stock_title: 'Здесь пока ничего нет',
            empty_in_stock_desc: 'Открывай кейсы!',
            empty_sold_title: 'Список продаж пуст',
            empty_sold_desc: 'Продавай предметы за BP',
            empty_withdrawn_title: 'Список вывода пуст',
            empty_withdrawn_desc: 'Выводи редкие предметы в Steam'
        },
        settings: {
            title: 'Настройки',
            language: 'Язык приложения',
            trade_url: 'Steam Trade URL',
            trade_url_hint: 'Используется для вывода предметов в Steam',
            save: 'Сохранить',
            saving: 'Сохранение...',
            saved: 'Настройки сохранены!',
            find_url: 'Где найти мою ссылку?',
            public_note: 'Внимание: Ссылка на обмен должна быть публичной.'
        },
        tasks: {
            title: 'Задания',
            claim: 'Забрать',
            completed: 'Выполнено',
            no_tasks: 'Заданий пока нет. Заходи позже!',
            earn_more: 'Зарабатывай больше BP'
        },
        friends: {
            title: 'Друзья',
            referral_program: 'Реферальная программа',
            invite_desc: 'Приглашай друзей и получай 10% от их дохода!',
            share: 'Пригласить',
            recruited: 'Приглашено',
            revenue: 'Доход',
            commission: 'Комиссия',
            no_friends: 'У тебя пока нет рефералов.',
            generate_link: 'Генерация ссылки...',
            share_text: 'Заходи и открывай кейсы Dota 2! При входе по моей ссылке получишь бонус! 🎁',
            stats: 'Статистика',
            total_friends: 'Всего друзей',
            bonus_earned: 'Бонусов получено',
            loading_friends: 'Загрузка друзей...',
            referral_link: 'Твоя реферальная ссылка'
        },
        leaderboard: {
            title: 'Топ игроков',
            rank: 'Место',
            player: 'Игрок',
            balance: 'Баланс',
            items: 'предметов',
            champion: 'Чемпион',
            you: 'ТЫ',
            top_players: 'Топ игроков по балансу'
        },
        history: {
            title: 'История',
            empty: 'История пуста',
            log: 'Журнал транзакций: здесь записаны все изменения баланса.',
            case_open: 'Кейс: ',
            item_sell: 'Продажа: ',
            referral_bonus: 'Бонус: ',
            referral_income: 'Доход: '
        },
        cases: {
            title: 'Магазин кейсов',
            opening: 'Открытие...',
            activate: 'Активировать',
            reset: 'Сбросить',
            contents: 'Содержимое',
            acquired: 'Вы получили!',
            available: 'Доступные сокровища',
            open_case: 'Открыть кейс'
        }
    },
    en: {
        common: {
            bp: 'BP',
            status_online: 'Status: Online',
            loading: 'Loading',
            open: 'Open',
            close: 'Close',
            soon: 'Soon',
            processing: 'Processing',
            error: 'Error',
            confirm: 'Confirm',
            sell: 'Sell',
            back: 'Back',
            success: 'Success',
            cancel: 'Cancel'
        },
        nav: {
            home: 'Home',
            cases: 'Cases',
            friends: 'Friends',
            profile: 'Profile',
            tasks: 'Tasks',
            leaderboard: 'Leaderboard'
        },
        home: {
            network_balance: 'Network Balance',
            view_transactions: 'View Transactions',
            recommended: 'Recommended'
        },
        profile: {
            title: 'Profile',
            collector: 'Dota 2 Collector',
            best_drop: 'Best Drop',
            share_record: 'Share Record',
            balance_bp: 'Balance (BP)',
            inventory: 'Inventory',
            settings: 'Settings',
            admin: 'Admin Panel',
            share_text: 'Look at this drop I got in Dota 2 Mini App! 🎁',
            theme: 'Interface Theme',
            total_opened: 'Total Opened',
            earned_bp: 'Earned BP',
            personal_stats: 'Personal Statistics'
        },
        inventory: {
            title: 'Inventory',
            empty_title: 'Inventory is empty',
            empty_desc: 'Open your first case!',
            sell_item: 'Sell Item',
            withdraw: 'Withdraw to Steam',
            sell_all_button: 'Sell All',
            mass_sell_confirm_title: 'Mass Sell Confirmation',
            mass_sell_confirm_desc: 'You are about to sell all items in stock ({count} items) for a total of:',
            empty_in_stock_title: 'Nothing here yet',
            empty_in_stock_desc: 'Open some cases!',
            empty_sold_title: 'Sales list is empty',
            empty_sold_desc: 'Sell items for BP',
            empty_withdrawn_title: 'Withdrawal list is empty',
            empty_withdrawn_desc: 'Withdraw rare items to Steam'
        },
        settings: {
            title: 'Settings',
            language: 'App Language',
            trade_url: 'Steam Trade URL',
            trade_url_hint: 'Used for withdrawing items to Steam',
            save: 'Save',
            saving: 'Saving...',
            saved: 'Settings saved!',
            find_url: 'Where is my link?',
            public_note: 'Note: The trade link must be public.'
        },
        tasks: {
            title: 'Tasks',
            claim: 'Claim',
            completed: 'Completed',
            no_tasks: 'No tasks available. Check back later!',
            earn_more: 'Earn more BP'
        },
        friends: {
            title: 'Friends',
            referral_program: 'Referral Program',
            invite_desc: 'Invite friends and get 10% of their earnings!',
            share: 'Invite',
            recruited: 'Recruited',
            revenue: 'Revenue',
            commission: 'Commission',
            no_friends: 'You have no recruits yet.',
            generate_link: 'Generating link...',
            share_text: 'Join and open Dota 2 cases! Get a bonus when you join via my link! 🎁',
            stats: 'Statistics',
            total_friends: 'Total Friends',
            bonus_earned: 'Bonus Earned',
            loading_friends: 'Loading friends...',
            referral_link: 'Your referral link'
        },
        leaderboard: {
            title: 'Leaderboard',
            rank: 'Rank',
            player: 'Player',
            balance: 'Balance',
            items: 'items',
            champion: 'Champion',
            you: 'YOU',
            top_players: 'Top players by balance'
        },
        history: {
            title: 'History',
            empty: 'History is empty',
            log: 'Transaction Log: all balance changes are recorded here.',
            case_open: 'Case: ',
            item_sell: 'Sell: ',
            referral_bonus: 'Bonus: ',
            referral_income: 'Income: '
        },
        cases: {
            title: 'Case Shop',
            opening: 'Opening...',
            activate: 'Activate Unit',
            reset: 'Reset Sequence',
            contents: 'Unit Contents',
            acquired: 'You received!',
            available: 'Available Treasures',
            open_case: 'Open Case'
        }
    }
};
