Vue.component('stats', {
    template: `
<div class="card d-inline-block mx-2" style="width: 200px;">
    <div v-if="retrieved" class="card-body p-1">
        <h5 class="card-title text-success">Уровень: {{ total_level }}</h5>
        <h6 class="card-subtitle mb-2">Текущий уровень: {{ level }}</h6>
        <h6 class="card-subtitle mb-2 text-muted">Всего решил: {{ total_solved }}</h6>
    </div>
    <div v-else class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Загрузка</span>
      </div>
    </div>
</div>
    `,
    computed: {
        level: function () {
            return this['level_' + this.page.substr(5)]
        }
    },
    data: function () {
        return {
            level_sum: 0,
            level_sub: 0,
            level_mul: 0,
            level_div: 0,
            total_level: 0,
            total_solved: 0,
            retrieved: false,
        }
    },
    created() {
        this.update();
    },
    methods: {
        update: async function () {
            let result;
            console.log('update');
            await axios
                .get('/sasha.json')
                .then(function (response) {
                    result = response.data;
                });

            this.level_sum = result.level_sum;
            this.level_sub = result.level_sub;
            this.level_mul = result.level_mul;
            this.level_div = result.level_div;
            this.total_level = result.level_total;
            this.total_solved = result.total_solved_tasks;
            this.retrieved = true;
        }
    },
    mounted() {
        let element = this;
        this.$root.$on('success', function () {
            element.retrieved = false;
            element.update();
        });
    },
    props: ['page'],
});

Vue.component('math-task', {
    template: `
<div class="mb-5 input-group" style="width: 300px;">
    <div class="input-group-prepend">
        <span class="input-group-text text-white bg-primary" :style="{fontSize: fontSize}">
            {{ valueLeft }} {{ operator }} {{ valueRight }} = 
        </span>
    </div>
    <input v-model.number="answer" type="number" :class="validation" class="form-control" :style="{fontSize: fontSize}">
    <div class="valid-tooltip">
        Правильно!
    </div>
    <div class="invalid-tooltip">
        Ошибка! Попробуй еще раз.
    </div>
</div>
    `,
    created: function () {
        this.seed();
    },
    data: function () {
        return {
            fontSize: '25px',
            valueLeft: 0,
            valueRight: 0,
            answer: 0,
            validation: {
                'is-valid': false,
                'is-invalid': false
            }
        }
    },
    methods: {
        seed: function () {
            if (this.operator === '÷') {
                this.valueRight = Math.ceil(Math.random() * this.max / 4);
                this.valueLeft = this.valueRight * this.generateRandomNumber();
            } else if (this.operator === '×') {
                this.valueLeft = Math.round(this.generateRandomNumber() / 5);
                this.valueRight = Math.round(this.generateRandomNumber() / 5);
            } else if (this.operator === '-') {
                let value_1 = this.generateRandomNumber();
                let value_2 = this.generateRandomNumber();

                if (value_1 >= value_2) {
                    this.valueLeft = value_1;
                    this.valueRight = value_2;
                } else {
                    this.valueLeft = value_2;
                    this.valueRight = value_1;
                }
            } else {
                this.valueLeft = this.generateRandomNumber();
                this.valueRight = this.generateRandomNumber();
            }
            this.validation["is-valid"] = false;
            this.validation["is-invalid"] = false;
        },
        generateRandomNumber: function () {
            return Math.round(Math.random() * this.max);
        },
        // Проверка правильности решения примера
        check: function () {
            let result;

            if (this.operator === '+') {
                result = this.valueLeft + this.valueRight;
            } else if (this.operator === '-') {
                result = this.valueLeft - this.valueRight;
            } else if (this.operator === '×') {
                result = this.valueLeft * this.valueRight;
            } else if (this.operator === '÷') {
                result = this.valueLeft / this.valueRight;
            }

            let check = result === this.answer;

            if (check) {
                this.validation["is-valid"] = true;
                this.validation["is-invalid"] = false;
            } else {
                this.validation["is-valid"] = false;
                this.validation["is-invalid"] = true;
            }
            return result === this.answer;
        }
    },
    props: {
        max: Number,
        operator: {
            validator: function (value) {
                return value === '+' || value === '-' || value === '×' || value === '÷';
            }
        }
    }
});

Vue.component('math-tasks-list', {
    template: `
<div v-if="retrieved">
    <math-task v-for="n in number" :key="n" :max="level * 10" :operator="operator"></math-task>
    <button @click="check" class="btn btn-success btn-lg">Проверить</button>
    
    <!-- Modal Success -->
    <div class="modal fade" id="success" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-success">Молодец!</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-primary">
                    <img :src="image_success" class="w-50 rounded mx-auto d-block" alt="картинка">
                    <p>Ты решил все задания и достиг уровня {{ level + 1 }}.</p>
                    <p class="text-danger"><b>{{ tried }}</b></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal Fail -->
    <div class="modal fade" id="error" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-danger">Ошибка!</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-primary">
                    <img :src="image_error" class="w-50 rounded mx-auto d-block" alt="картинка">
                    <p>Ой, ошибка. Я верю, что у тебя всё получится. Попробуй еще раз!</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
                </div>
            </div>
        </div>
    </div>
    
</div>
<div v-else class="text-center">
  <div class="spinner-border text-primary" role="status" style="width: 50px; height: 50px;">
    <span class="sr-only">Загрузка</span>
  </div>
</div>
    `,
    async created() {
        let result;

        if (this.operator === '+') {
            this.operation_name = 'sum';
        } else if (this.operator === '-') {
            this.operation_name = 'sub';
        } else if (this.operator === '×') {
            this.operation_name = 'mul';
        } else if (this.operator === '÷') {
            this.operation_name = 'div';
        }

        let operation_name = this.operation_name;

        await axios
            .get('/sasha.json')
            .then(function (response) {
                result = response.data['level_' + operation_name];
            });
        this.level = result;
        this.retrieved = true;
    },
    data: function () {
        return {
            errors: [
                'Ты исправил все ошибки! Это просто супер!',
                'Вау! Все ошибки поправлены!',
                'Еще круто, что ты исправил все ошибки!',
                'Я в восторге от того, что ты исправил все ошибки!'
            ],
            images_success: [
                '/images/omg.png',
                '/images/haha.png',
                '/images/i_will_do_it.png'
            ],
            images_error: [
                '/images/aaaaa.png',
                '/images/besit.png',
                '/images/do_not_know.png',
                '/images/ne_ponal.png',
                '/images/upsi.png'
            ],
            image_success: '',
            image_error: '',
            level: 1,
            operation_name: '',
            retrieved: false,
            tried: '',
        }
    },
    methods: {
        check: function () {
            let error = false;
            let element = this;

            this.$children.forEach(function (elem) {
                if (elem.check() === false) {
                    if (!error) {
                        element.showError();
                    }
                    error = true;
                }
            });

            if (!error) {
                let solved_tasks = this.number;
                let operator_name = this.operation_name;
                let params = new URLSearchParams;
                let element = this;
                params.append('solved_tasks', solved_tasks);
                params.append('operator_name', operator_name);

                axios.post('/request.php', params)
                    .then(function () {
                        element.$children.forEach(function (elem) {
                            elem.seed();
                        });
                        element.$root.$emit('success');
                        element.showSuccess();
                    });
            }
        },
        showSuccess: function () {
            this.image_success = this.images_success[Math.round(Math.random() * (this.images_success.length - 1))];
            $('#success').modal('show');
        },
        showError: function () {
            this.tried = this.errors[Math.round(Math.random() * (this.errors.length - 1))];
            this.image_error = this.images_error[Math.round(Math.random() * (this.images_error.length - 1))];
            $('#error').modal('show');
        }
    },
    props: {
        number: Number,
        operator: String
    }
});

Vue.component('math-sum', {
    template: `
<math-tasks-list :number="5" operator="+"></math-tasks-list>
    `
});

Vue.component('math-sub', {
    template: `
<math-tasks-list :number="5" operator="-"></math-tasks-list>
    `
});

Vue.component('math-mul', {
    template: `
<math-tasks-list :number="5" operator="×"></math-tasks-list>
    `
});

Vue.component('math-div', {
    template: `
<math-tasks-list :number="5" operator="÷"></math-tasks-list>
    `
});

let app = new Vue({
    el: '#app',
    data: {
        header: 'Математика для Саши',
        page: 'math-sum',
        menu: [
            {name: 'Сложение', tag: 'sum'},
            {name: 'Вычитание', tag: 'sub'},
            {name: 'Умножение', tag: 'mul'},
            {name: 'Деление', tag: 'div'},
        ]
    },
    methods: {
        switchPage: function (page) {
            this.page = 'math-' + page;
        }
    }
});