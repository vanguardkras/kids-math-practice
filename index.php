<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Задачи</title>
    <link href="/vendor/bootstrap-4.4.1/css/bootstrap.min.css" rel="stylesheet" type="text/css">
</head>
<body>

<div class="container-sm shadow my-2 p-3" id="app">
    <div class="text-center row justify-content-center align-items-center">
        <h2>{{ header }}</h2>
        <stats :page="page"></stats>
        <img style="height: 100px;" src="/images/privet.png" alt="hi">
    </div>

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText"
                aria-controls="navbarText">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
            <ul class="navbar-nav mx-auto">
                <li class="nav-item mr-1" v-for="nav in menu">
                    <button class="nav-link btn" :class="{'btn-warning': page === 'math-' + nav.tag}"
                            @click="switchPage(nav.tag)">{{ nav.name }}
                    </button>
                </li>
            </ul>
        </div>
    </nav>

    <component :is="page"></component>

</div>


<script src="/vendor/jquery-3.4.1.min.js"></script>
<script src="/vendor/bootstrap-4.4.1/js/bootstrap.bundle.min.js"></script>
<script src="/vendor/vue.js"></script>
<script src="/vendor/axios.min.js"></script>
<script src="/js/main.js"></script>
</body>
</html>
