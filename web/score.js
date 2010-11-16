function score(questions, voterAnswers, candidates, candidatesAnswers) {
	for(var c in candidates) {
		var candidate = candidates[c]
		candidate.score = 0
        var candidateAnswers = candidatesAnswers[candidate.nr]
        if(candidateAnswers) {
		  for(var v in voterAnswers) {
            candidate.score += match(indexedQuestions[v], voterAnswers[v], candidateAnswers[v]) 
		  }
		}
	}
}

function match(question, voterAnswer, candidateAnswer) {
	voterAnswer = getRemappedValue(question, voterAnswer)
	candidateAnswer = getRemappedValue(question, candidateAnswer)
	if(candidateAnswer > 50 || voterAnswer > 50) {
		return 0
	}
	return Math.round(10 * (question.numSignificantOptions - Math.abs(voterAnswer - candidateAnswer)) / question.numSignificantOptions, 0)
}

function getRemappedValue(question, value) {
	if(question.remap) {
		if(question.remap[value]) {
			return question.remap[value]
		}
	}
	return value
}

// Event reactions

function onAnswerChanged() {
	var voterAnswers = {}
	$("select.answer").each(function(index, select) {
		if(select.value != "") {
		  voterAnswers[select.name] = select.value
		}
	})
	score(questions, voterAnswers, candidates, candidatesAnswers)
	candidates.sort(function(cand1, cand2) { return cand2.score - cand1.score })
	renderCandidates(candidates)
}

function onFixHoverIn(e) {
	fixed = false
	saveMyAnswers()
	var pos = e.currentTarget.id.replace(/cand_fix_(.*)/, '$1')
	var nr = $('#cand_nr_' + pos).text()
	if(candidatesAnswers[nr]) {
	    loadAnswers(candidatesAnswers[nr])
	}
}

function onFixHoverOut() {
	if(!fixed) {
		loadAnswers(myAnswers)
	}
}

function onFixClick() {
	fixed = true
    onAnswerChanged()
}

// Display candidate answers temporarily instead of mine

var myAnswers = null
var myAnswerKeys = null
var fixed = false;

function saveMyAnswers() {
	myAnswers = {}
	myAnswerKeys = []
	$('select').each(function(index, select) {
		myAnswers[select.name] = select.value
		myAnswerKeys[myAnswerKeys.length] = select.name
	})
}

function loadAnswers(answers) {
	console.log(answers)
	for(var name in answers) {
		$('#' + name).val(answers[name])
	}
}

// Render candidates

function renderCandidates(candidates) {
	var i = 0
	for(var ic = (page - 1) * 25; ic < page * 25; ic++) {
		renderCandidate(i, candidates[ic])
		i++
	}
    $('#pagenr').text(page)
}

function renderCandidate(i, cand) {
	if(!cand) {
		cand = {score: "", nr: "", name: "", dvlink: ""}
	}
    $('#cand_score_' + i).text(cand.score)
    $('#cand_thumbnail_' + i).attr('src', 'images/thumbnails/' + cand.nr + '.jpg')
    $('#cand_name_' + i).text(cand.name)
    if(cand.dvlink) {
        $('#cand_name_' + i).attr('href', 'http://www.dv.is/stjornlagathing/' + cand.dvlink + '/konnun')
    } else {
        $('#cand_name_' + i).attr('href', '')
    }
    // $('#cand_name_' + i).attr('title', cand.tooltip)
    $('#cand_nr_' + i).text(cand.nr)
}

var page = 1
var numPages = 21 
	
function firstPage() {
	page = 1
	renderCandidates(candidates)
}

function previousPage() {
	if(page > 1) {
		page--
		renderCandidates(candidates)
	}
}

function nextPage() {
	if(page < numPages) {
		page++
		renderCandidates(candidates)
	}
}

function lastPage() {
	page = 21
	renderCandidates(candidates)
}

// Prepare run

function countSignificantOptions(questions) {
	for(var i = 0; i < questions.length; i++) {
		var q = questions[i]
		q.numSignificantOptions = 0
		for(var o in q.options) {
			if(o < 100) {
				q.numSignificantOptions++
			}
		}
	}
}

function indexQuestions(questions) {
	var iqs = {}
	for(var i = 0; i < questions.length; i++) {
		var q = questions[i]
		iqs[q.name] = q
	}
	return iqs
}

function constructTooltips(candidates) {
	for(var i = 0; i < candidates.length; i++) {
		var cand = candidates[i]
		cand.tooltip = cand.infos['stada'] + ' ' + cand.infos['adsetur'] + ' fædd(ur) ' + cand.infos['f_ar']
	}
}

function assignRandomSortOrder(candidates) {
	for(var i = new Date().getSeconds; i > 0; i--) {
		Math.random() // seed
	}
	for(var i = 0; i < candidates.length; i++) {
		var cand = candidates[i]
		cand.random = Math.floor(Math.random() * 1000)
	}
}

var indexedQuesions = null

$(document).ready(function() {
	countSignificantOptions(questions)
	indexedQuestions = indexQuestions(questions)
	$('select').change(onAnswerChanged)
	$('.fix').hover(onFixHoverIn, onFixHoverOut)
	$('.fix').click(onFixClick)
	$('#first').click(firstPage)
	$('#prev').click(previousPage)
	$('#next').click(nextPage)
	$('#last').click(lastPage)
	onAnswerChanged()
	// constructTooltips(candidates)
	// assignRandomSortOrder()
})



