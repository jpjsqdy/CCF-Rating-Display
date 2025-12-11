// CCF Rating Display Content Script

(function () {
  'use strict'

  // Helper to replace GM_addStyle
  function addStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  const Utils = (function () {
    function idle(cb) {
      if ('requestIdleCallback' in window) { requestIdleCallback(cb, { timeout: 1000 }) } else { setTimeout(cb, 200) }
    }
    function debounce(fn, wait) {
      let t = null
      return function () { if (t) clearTimeout(t); t = setTimeout(fn, wait) }
    }
    return { idle, debounce }
  })()

  // 用户可在此处直接填入远程数据源 URL (例如 Gitee Raw 链接)
  const DEFAULT_REMOTE_URL = 'https://gitee.com/jpjsqdy/ccf-data/raw/master/ccf_sci_data.json'

  const Config = (function () {
    const defaults = {
      showTag: true,
      showUnrecognized: true,
      tagSize: 'sm',
      enableRemoteUpdate: false,
      remoteUrl: DEFAULT_REMOTE_URL,
      logLevel: 'warn',
      debug: false,
    }

    let cache = { ...defaults };

    // Async init to load from storage
    async function init() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['ccf_config'], (result) => {
          const saved = result.ccf_config || {};
          // 确保 remoteUrl 有默认值
          if (!saved.remoteUrl && defaults.remoteUrl) saved.remoteUrl = defaults.remoteUrl;
          cache = Object.assign({}, defaults, saved);
          resolve();
        });
      });
    }

    function get() {
      return cache;
    }

    function set(next) {
      cache = next;
      chrome.storage.local.set({ 'ccf_config': next });
    }

    // Listen for changes from Popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.ccf_config) {
        cache = changes.ccf_config.newValue;
        // Optional: trigger re-render or reload if needed
        // For now, we might just let the next render cycle pick it up, 
        // or we could force a reload if critical settings change.
      }
    });

    return { init, get, set }
  })()


  const Builtin = (function () {
    const conf = {
      'CVPR': 'A',
      'IEEE/CVF Conference on Computer Vision and Pattern Recognition': 'A',
      'ICCV': 'A',
      'International Conference on Computer Vision': 'A',
      'ECCV': 'A',
      'European Conference on Computer Vision': 'A',
      'NeurIPS': 'A',
      'Neural Information Processing Systems': 'A',
      'NIPS': 'A',
      'ICML': 'A',
      'International Conference on Machine Learning': 'A',
      'ICLR': 'A',
      'International Conference on Learning Representations': 'A',
      'ACL': 'A',
      'Annual Meeting of the Association for Computational Linguistics': 'A',
      'SIGKDD': 'A',
      'KDD': 'A',
      'ACM SIGKDD Conference on Knowledge Discovery and Data Mining': 'A',
      'SIGIR': 'A',
      'International ACM SIGIR Conference on Research and Development in Information Retrieval': 'A',
      'WWW': 'A',
      'The Web Conference': 'A',
      'International World Wide Web Conference': 'A',
      'SIGMOD': 'A',
      'ACM SIGMOD Conference': 'A',
      'VLDB': 'A',
      'International Conference on Very Large Data Bases': 'A',
      'ICDE': 'A',
      'International Conference on Data Engineering': 'A',
      'SIGCOMM': 'A',
      'ACM SIGCOMM Conference': 'A',
      'INFOCOM': 'A',
      'IEEE International Conference on Computer Communications': 'A',
      'NSDI': 'A',
      'USENIX Symposium on Networked Systems Design and Implementation': 'A',
      'S&P': 'A',
      'IEEE Symposium on Security and Privacy': 'A',
      'Oakland': 'A',
      'CCS': 'A',
      'ACM Conference on Computer and Communications Security': 'A',
      'USENIX Security': 'A',
      'USENIX Security Symposium': 'A',
      'NDSS': 'A',
      'Network and Distributed System Security Symposium': 'A',
      'SOSP': 'A',
      'ACM Symposium on Operating Systems Principles': 'A',
      'OSDI': 'A',
      'USENIX Symposium on Operating Systems Design and Implementation': 'A',
      'ASPLOS': 'A',
      'International Conference on Architectural Support for Programming Languages and Operating Systems': 'A',
      'ISCA': 'A',
      'International Symposium on Computer Architecture': 'A',
      'MICRO': 'A',
      'IEEE/ACM International Symposium on Microarchitecture': 'A',
      'HPCA': 'A',
      'IEEE International Symposium on High-Performance Computer Architecture': 'A',
      'PLDI': 'A',
      'ACM SIGPLAN Conference on Programming Language Design and Implementation': 'A',
      'POPL': 'A',
      'ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages': 'A',
      'OOPSLA': 'A',
      'Conference on Object-Oriented Programming Systems, Languages, and Applications': 'A',
      'FSE': 'A',
      'ACM SIGSOFT Symposium on the Foundations of Software Engineering': 'A',
      'ESEC/FSE': 'A',
      'ICSE': 'A',
      'International Conference on Software Engineering': 'A',
      'ASE': 'A',
      'International Conference on Automated Software Engineering': 'A',
      'RTSS': 'A',
      'IEEE Real-Time Systems Symposium': 'A',
      'RTAS': 'A',
      'IEEE Real-Time and Embedded Technology and Applications Symposium': 'A',
      'AAAI': 'B',
      'AAAI Conference on Artificial Intelligence': 'B',
      'IJCAI': 'B',
      'International Joint Conference on Artificial Intelligence': 'B',
      'EMNLP': 'B',
      'Conference on Empirical Methods in Natural Language Processing': 'B',
      'NAACL': 'B',
      'Annual Conference of the North American Chapter of the Association for Computational Linguistics': 'B',
      'SIGCHI': 'B',
      'CHI': 'B',
      'ACM Conference on Human Factors in Computing Systems': 'B',
      'CIKM': 'B',
      'ACM International Conference on Information and Knowledge Management': 'B',
      'WSDM': 'B',
      'ACM International Conference on Web Search and Data Mining': 'B',
      'ICASSP': 'B',
      'IEEE International Conference on Acoustics, Speech and Signal Processing': 'B',
      'ICDM': 'B',
      'IEEE International Conference on Data Mining': 'B',
      'PODS': 'B',
      'ACM SIGMOD/PODS Conference': 'B',
      'ICNP': 'B',
      'International Conference on Network Protocols': 'B',
      'IMC': 'B',
      'Internet Measurement Conference': 'B',
      'MobiCom': 'B',
      'ACM International Conference on Mobile Computing and Networking': 'B',
      'MobiSys': 'B',
      'International Conference on Mobile Systems, Applications, and Services': 'B',
      'SenSys': 'B',
      'ACM Conference on Embedded Networked Sensor Systems': 'B',
      'CoNEXT': 'B',
      'ACM International Conference on emerging Networking EXperiments and Technologies': 'B',
      'ESORICS': 'B',
      'European Symposium on Research in Computer Security': 'B',
      'ACSAC': 'B',
      'Annual Computer Security Applications Conference': 'B',
      'RAID': 'B',
      'International Symposium on Recent Advances in Intrusion Detection': 'B',
      'EuroSys': 'B',
      'European Conference on Computer Systems': 'B',
      'FAST': 'B',
      'USENIX Conference on File and Storage Technologies': 'B',
      'USENIX ATC': 'B',
      'USENIX Annual Technical Conference': 'B',
      'ISSTA': 'B',
      'International Symposium on Software Testing and Analysis': 'B',
      'ESEC': 'B',
      'European Software Engineering Conference': 'B',
      'ICFP': 'B',
      'ACM SIGPLAN International Conference on Functional Programming': 'B',
      'CAV': 'B',
      'International Conference on Computer Aided Verification': 'B',
      'LICS': 'B',
      'IEEE Symposium on Logic in Computer Science': 'B',
      'RTCSA': 'B',
      'IEEE International Conference on Embedded and Real-Time Computing Systems and Applications': 'B',
      'COLING': 'C',
      'International Conference on Computational Linguistics': 'C',
      'CoNLL': 'C',
      'Conference on Computational Natural Language Learning': 'C',
      'EACL': 'C',
      'Conference of the European Chapter of the Association for Computational Linguistics': 'C',
      'ECIR': 'C',
      'European Conference on Information Retrieval': 'C',
      'PAKDD': 'C',
      'Pacific-Asia Conference on Knowledge Discovery and Data Mining': 'C',
      'ICSOC': 'C',
      'International Conference on Service Oriented Computing': 'C',
      'WISE': 'C',
      'International Conference on Web Information Systems Engineering': 'C',
      'DASFAA': 'C',
      'Database Systems for Advanced Applications': 'C',
      'GLOBECOM': 'C',
      'IEEE Global Communications Conference': 'C',
      'ICC': 'C',
      'IEEE International Conference on Communications': 'C',
      'ICDCS': 'C',
      'International Conference on Distributed Computing Systems': 'C',
      'ICPP': 'C',
      'International Conference on Parallel Processing': 'C',
      'IWQoS': 'C',
      'International Workshop on Quality of Service': 'C',
      'SRDS': 'C',
      'Symposium on Reliable Distributed Systems': 'C',
      'DSN': 'C',
      'International Conference on Dependable Systems and Networks': 'C',
      'CHES': 'C',
      'International Conference on Cryptographic Hardware and Embedded Systems': 'C',
      'EMSOFT': 'C',
      'International Conference on Embedded Software': 'C',
      'LCTES': 'C',
      'ACM SIGPLAN/SIGBED Conference on Languages, Compilers, Tools and Theory for Embedded Systems': 'C',
      'MASCOTS': 'C',
      'International Symposium on Modeling, Analysis, and Simulation of Computer and Telecommunication Systems': 'C',
      'MIDDLEWARE': 'C',
      'International Middleware Conference': 'C',
      'ICECCS': 'C',
      'IEEE International Conference on Engineering of Complex Computer Systems': 'C',
      'SANER': 'C',
      'IEEE International Conference on Software Analysis, Evolution, and Reengineering': 'C',
      'ICSME': 'C',
      'International Conference on Software Maintenance and Evolution': 'C',
      'VMCAI': 'C',
      'International Conference on Verification, Model Checking, and Abstract Interpretation': 'C',
      'ISSRE': 'C',
      'International Symposium on Software Reliability Engineering': 'C',
      'ISPASS': 'C',
      'IEEE International Symposium on Performance Analysis of Systems and Software': 'C',
    }
    const journ = {
      'TPAMI': 'A',
      'IEEE Transactions on Pattern Analysis and Machine Intelligence': 'A',
      'IJCV': 'A',
      'International Journal of Computer Vision': 'A',
      'TIP': 'A',
      'IEEE Transactions on Image Processing': 'A',
      'JMLR': 'A',
      'Journal of Machine Learning Research': 'A',
      'TNNLS': 'A',
      'IEEE Transactions on Neural Networks and Learning Systems': 'A',
      'TASLP': 'A',
      'IEEE/ACM Transactions on Audio, Speech, and Language Processing': 'A',
      'TKDE': 'A',
      'IEEE Transactions on Knowledge and Data Engineering': 'A',
      'TOIS': 'A',
      'ACM Transactions on Information Systems': 'A',
      'TODS': 'A',
      'ACM Transactions on Database Systems': 'A',
      'TON': 'A',
      'IEEE/ACM Transactions on Networking': 'A',
      'JSAC': 'A',
      'IEEE Journal on Selected Areas in Communications': 'A',
      'TMC': 'A',
      'IEEE Transactions on Mobile Computing': 'A',
      'TDSC': 'A',
      'IEEE Transactions on Dependable and Secure Computing': 'A',
      'TIFS': 'A',
      'IEEE Transactions on Information Forensics and Security': 'A',
      'TC': 'A',
      'IEEE Transactions on Computers': 'A',
      'TCAD': 'A',
      'IEEE Transactions on Computer-Aided Design of Integrated Circuits and Systems': 'A',
      'TOPLAS': 'A',
      'ACM Transactions on Programming Languages and Systems': 'A',
      'TSE': 'A',
      'IEEE Transactions on Software Engineering': 'A',
      'TOSEM': 'A',
      'ACM Transactions on Software Engineering and Methodology': 'A',
      'TECS': 'A',
      'ACM Transactions on Embedded Computing Systems': 'A',
      'TRETS': 'A',
      'ACM Transactions on Reconfigurable Technology and Systems': 'A',
      'TVLSI': 'A',
      'IEEE Transactions on Very Large Scale Integration Systems': 'A',
      'TNN': 'B',
      'IEEE Transactions on Neural Networks': 'B',
      'TGRS': 'B',
      'IEEE Transactions on Geoscience and Remote Sensing': 'B',
      'TVCG': 'B',
      'IEEE Transactions on Visualization and Computer Graphics': 'B',
      'TCSVT': 'B',
      'IEEE Transactions on Circuits and Systems for Video Technology': 'B',
      'TALIP': 'B',
      'ACM Transactions on Asian Language Information Processing': 'B',
      'TWEB': 'B',
      'ACM Transactions on the Web': 'B',
      'TIST': 'B',
      'ACM Transactions on Intelligent Systems and Technology': 'B',
      'TKDD': 'B',
      'ACM Transactions on Knowledge Discovery from Data': 'B',
      'VLDB Journal': 'B',
      'The VLDB Journal': 'B',
      'TMM': 'B',
      'IEEE Transactions on Multimedia': 'B',
      'TCOM': 'B',
      'IEEE Transactions on Communications': 'B',
      'TNSM': 'B',
      'IEEE Transactions on Network and Service Management': 'B',
      'TETC': 'B',
      'IEEE Transactions on Emerging Topics in Computing': 'B',
      'TPDS': 'B',
      'IEEE Transactions on Parallel and Distributed Systems': 'B',
      'JPDC': 'B',
      'Journal of Parallel and Distributed Computing': 'B',
      'JSS': 'B',
      'Journal of Systems and Software': 'B',
      'ESE': 'B',
      'Empirical Software Engineering': 'B',
      'TOSN': 'B',
      'ACM Transactions on Sensor Networks': 'B',
      'TOIT': 'B',
      'ACM Transactions on Internet Technology': 'B',
      'TALLIP': 'C',
      'ACM Transactions on Asian and Low-Resource Language Information Processing': 'C',
      'JCST': 'C',
      'Journal of Computer Science and Technology': 'C',
      'FGCS': 'C',
      'Future Generation Computer Systems': 'C',
      'DKE': 'C',
      'Data and Knowledge Engineering': 'C',
      'WWWJ': 'C',
      'World Wide Web Journal': 'C',
      'TOMCCAP': 'C',
      'ACM Transactions on Multimedia Computing, Communications, and Applications': 'C',
      'COMNET': 'C',
      'Computer Networks': 'C',
      'PARCO': 'C',
      'Parallel Computing': 'C',
      'JNCA': 'C',
      'Journal of Network and Computer Applications': 'C',
      'MONET': 'C',
      'Mobile Networks and Applications': 'C',
      'JCS': 'C',
      'Journal of Computer Security': 'C',
      'JETC': 'C',
      'ACM Journal on Emerging Technologies in Computing Systems': 'C',
      'JSA': 'C',
      'Journal of Systems Architecture': 'C',
      'RESS': 'C',
      'Reliability Engineering and System Safety': 'C',
      'CSUR': 'C',
      'ACM Computing Surveys': 'C',
      'SPE': 'C',
      'Software: Practice and Experience': 'C',
      'SQJ': 'C',
      'Software Quality Journal': 'C',
      'IST': 'C',
      'Information and Software Technology': 'C',
      'IET Software': 'C',
      'Expert Systems with Applications': 'C',
      'Information Processing and Management': 'B',
      'Knowledge-Based Systems': 'C',
      'Information Sciences': 'B',
      'Neurocomputing': 'C',
      'Pattern Recognition': 'B',
      'IEEE Transactions on Pattern Analysis and Machine Intelligence': 'A',
      'IEEE Transactions on Image Processing': 'A',
      'IEEE Transactions on Knowledge and Data Engineering': 'A',
      'IEEE Transactions on Mobile Computing': 'A',
      'IEEE Transactions on Parallel and Distributed Systems': 'A',
      'IEEE Transactions on Software Engineering': 'A',
    }

    // 内置部分 SCI/中科院分区数据 (示例)
    // 内置部分 SCI/中科院分区数据 (示例)
    const sci = {
      'IEEE Transactions on Pattern Analysis and Machine Intelligence': { sci: 'Q1', cas: '1区', if: '24.3' },
      'International Journal of Computer Vision': { sci: 'Q1', cas: '1区', if: '13.3' },
      'IEEE Transactions on Image Processing': { sci: 'Q1', cas: '1区', if: '10.8' },
      'Pattern Recognition': { sci: 'Q1', cas: '1区', if: '8.0' },
      'Expert Systems with Applications': { sci: 'Q1', cas: '1区', if: '8.5' },
      'Knowledge-Based Systems': { sci: 'Q1', cas: '1区', if: '8.8' },
      'Information Sciences': { sci: 'Q1', cas: '1区', if: '8.1' },
      'Neurocomputing': { sci: 'Q2', cas: '2区', if: '6.0' },
      'IEEE Transactions on Knowledge and Data Engineering': { sci: 'Q1', cas: '2区', if: '8.9' },
      'IEEE Transactions on Mobile Computing': { sci: 'Q1', cas: '2区', if: '7.9' },
      'IEEE Transactions on Parallel and Distributed Systems': { sci: 'Q1', cas: '2区', if: '5.3' },
      'IEEE Transactions on Software Engineering': { sci: 'Q1', cas: '1区', if: '7.4' },
    }

    return { conf, journ, sci }
  })()

  const DataStore = (function () {
    // 强制修正列表
    const Overrides = {
      'Knowledge-Based Systems': { ccf: 'C', sci: 'Q1', cas: '1区', if: '8.8' },
    }

    let index = null
    let dataset = null
    let lastRemoteUpdate = 0

    function normalize(s) {
      return (s || '')
        .toLowerCase()
        .replace(/\u00A0/g, ' ')
        .replace(/[\s\t]+/g, ' ')
        .replace(/[\(\[]?\d{4}[\)\]]?/g, '')
        .replace(/\bvol\.?\s*\d+/g, '')
        .replace(/\bno\.?\s*\d+/g, '')
        .replace(/\bissue\s*\d+/g, '')
        .replace(/&/g, ' ')
        .replace(/[-_,;]/g, ' ') // 将连字符、下划线、逗号、分号都替换为空格
        .replace(/\b\d+\s*$/g, '')
        .replace(/\b(of|with|and|in|on|for|the)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const ABBR_MAP = {
      'syst': 'systems', 'appl': 'applications', 'trans': 'transactions', 'int': 'international',
      'conf': 'conference', 'proc': 'proceedings', 'j': 'journal', 'comput': 'computer',
      'sci': 'science', 'eng': 'engineering', 'technol': 'technology', 'res': 'research',
      'dev': 'development', 'manag': 'management', 'inf': 'information', 'knowl': 'knowledge',
      'intell': 'intelligence', 'mach': 'machine', 'learn': 'learning', 'vis': 'vision',
      'process': 'processing', 'distrib': 'distributed', 'commun': 'communications',
      'netw': 'networks', 'sec': 'security', 'softw': 'software', 'anal': 'analysis',
      'des': 'design', 'arch': 'architecture', 'org': 'organization', 'serv': 'services',
      'mob': 'mobile', 'exp': 'experiments', 'rev': 'review', 'lett': 'letters',
      'soc': 'society', 'assoc': 'association', 'symp': 'symposium', 'wksp': 'workshop',
      'artif': 'artificial', 'recognit': 'recognition', 'autom': 'automation',
      'lang': 'languages', 'program': 'programming', 'oper': 'operating', 'found': 'foundations',
      'math': 'mathematics', 'log': 'logic', 'th': 'theory', 'alg': 'algorithms',
      'struct': 'structures', 'optim': 'optimization', 'graph': 'graphics',
      'interact': 'interaction', 'multimed': 'multimedia', 'educ': 'education', 'hist': 'history'
    }

    function expandAbbr(name) {
      if (!name) return name
      return name.toLowerCase().split(/\s+/).map(token => {
        const clean = token.replace(/\.$/, '')
        return ABBR_MAP[clean] || token
      }).join(' ')
    }

    function build() {
      const m = new Map()

      const merge = (k, val, type) => {
        const n = normalize(k)
        let obj = m.get(n) || {}
        if (type === 'ccf') obj.ccf = val
        else if (type === 'sci') Object.assign(obj, val)
        m.set(n, obj)

        const simple = n.replace(/^(ieee\/acm|ieee\/cvf|ieee|acm|international)\s+/g, '')
        if (simple !== n && simple.length > 2) {
          let sObj = m.get(simple) || {}
          if (type === 'ccf') sObj.ccf = val
          else if (type === 'sci') Object.assign(sObj, val)
          m.set(simple, sObj)
        }
      }

      Object.keys(Builtin.conf).forEach(k => merge(k, Builtin.conf[k], 'ccf'))
      Object.keys(Builtin.journ).forEach(k => merge(k, Builtin.journ[k], 'ccf'))
      if (Builtin.sci) {
        Object.keys(Builtin.sci).forEach(k => merge(k, Builtin.sci[k], 'sci'))
      }
      // 应用强制修正
      Object.keys(Overrides).forEach(k => merge(k, Overrides[k], 'sci'))

      index = m
    }

    function ensure() {
      if (!index) build()
    }

    function getRatingByName(name) {
      ensure()
      let n = normalize(name)
      if (!n) return null

      if (index.has(n)) return index.get(n)

      const expanded = normalize(expandAbbr(name))
      if (index.has(expanded)) return index.get(expanded)

      const simple = n.replace(/^(ieee\/acm|ieee\/cvf|ieee|acm|international)\s+/g, '')
      if (index.has(simple)) return index.get(simple)

      const tokens = n.split(/[\s\.:\-\(\)]+/).filter(t => t.length > 1)
      for (const [key, val] of index.entries()) {
        if (key.length > 3 && n.includes(key)) return val
        if (expanded.length > 3 && expanded.includes(key)) return val
        for (const t of tokens) {
          if (t.length >= 3 && key === t) return val
        }
      }
      return null
    }

    function mergeRemote(json) {
      ensure()
      if (!json || !json.items) return
      for (const it of json.items) {
        if (!it || !it.name) continue
        const n = normalize(it.name)
        let obj = index.get(n) || {}

        if (it.ccfRating) obj.ccf = it.ccfRating
        if (it.sciRating) obj.sci = it.sciRating
        if (it.casRating) obj.cas = it.casRating
        if (it.if) obj.if = it.if

        index.set(n, obj)

        if (Array.isArray(it.nameVariants)) {
          for (const v of it.nameVariants) {
            const vn = normalize(v)
            let vObj = index.get(vn) || {}
            Object.assign(vObj, obj)
            index.set(vn, vObj)
          }
        }
        if (it.abbr) {
          const an = normalize(it.abbr)
          let aObj = index.get(an) || {}
          Object.assign(aObj, obj)
          index.set(an, aObj)
        }
      }
      dataset = json
      chrome.storage.local.set({ 'ccf_dataset': json });
    }

    async function loadCached() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['ccf_dataset', 'ccf_remote_last_update'], (result) => {
          const cached = result.ccf_dataset;
          if (cached) mergeRemote(cached);
          lastRemoteUpdate = result.ccf_remote_last_update || 0;
          resolve();
        });
      });
    }

    function fetchRemote(url) {
      return new Promise((resolve) => {
        console.log('[CCF] 正在请求远程数据:', url)
        chrome.runtime.sendMessage({ type: 'FETCH_REMOTE_DATA', url: url }, (response) => {
          if (response && response.success) {
            console.log('[CCF] 远程数据解析成功, 条目数:', response.data.items ? response.data.items.length : 0)
            resolve(response.data)
          } else {
            console.error('[CCF] 远程请求失败:', response ? response.error : 'Unknown error')
            resolve(null)
          }
        });
      })
    }

    function fixUrl(url) {
      if (!url) return ''
      let u = url.trim()
      if (u.includes('gitee.com') && u.includes('/blob/')) {
        u = u.replace('/blob/', '/raw/')
      }
      else if (u.includes('github.com') && u.includes('/blob/')) {
        u = u.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
      }
      return u
    }

    async function init() {
      ensure()
      await loadCached()
      const cfg = Config.get()
      if (cfg.enableRemoteUpdate && cfg.remoteUrl) {
        const targetUrl = fixUrl(cfg.remoteUrl)
        const now = Date.now()
        const ttl = 24 * 60 * 60 * 1000

        if (lastRemoteUpdate === 0) {
          console.log('[CCF] 首次初始化，正在拉取远程数据...', targetUrl)
          const remote = await fetchRemote(targetUrl)
          if (remote) {
            mergeRemote(remote)
            chrome.storage.local.set({ 'ccf_remote_last_update': Date.now() });
            // alert(`[CCF] 远程数据加载成功！\n包含 ${remote.items.length} 条数据。\n请刷新页面查看效果。`)
            // Remove alert to avoid annoying user on every page load if it happens often, or keep it?
            // Original script had alert. Let's keep it but maybe log it mostly.
            console.log(`[CCF] 远程数据加载成功！包含 ${remote.items.length} 条数据。`)
          } else {
            console.error('[CCF] 远程数据加载失败')
          }
        } else if (now - lastRemoteUpdate > ttl) {
          // Background update
          setTimeout(async () => {
            const remote = await fetchRemote(targetUrl)
            if (remote) {
              mergeRemote(remote);
              chrome.storage.local.set({ 'ccf_remote_last_update': Date.now() });
            }
          }, 5000)
        }
      }
    }

    return { init, getRatingByName }
  })()

  const Extractor = (function () {
    function meta(name) {
      const el = document.querySelector(`meta[name="${name}"]`)
      return el ? el.getAttribute('content') || '' : ''
    }
    function common() {
      const j = meta('citation_journal_title')
      const c = meta('citation_conference_title')
      const issn = meta('citation_issn') || meta('citation_eissn')
      return { journal: j, conference: c, issn }
    }
    function scholarItem(item) {
      const t = item.querySelector('.gs_rt')
      const v = item.querySelector('.gs_a')
      return { title: t ? t.textContent : '', venue: v ? v.textContent : '' }
    }
    function dblpItem(item) {
      const t = item.querySelector('.title')
      // DBLP 结构优化：
      // 1. 优先找 .venue (会议通常有)
      // 2. 找 itemprop="isPartOf" (期刊/会议集通常有) -> span[itemprop="name"]
      // 3. 绝对不要找 .publ (那是操作按钮栏)
      let v = item.querySelector('.venue')
      if (!v) {
        const dataEl = item.querySelector('.data') || item
        // 尝试通过 Schema 属性查找
        v = dataEl.querySelector('span[itemprop="isPartOf"] span[itemprop="name"]') ||
          dataEl.querySelector('span[itemprop="isPartOf"]')
      }

      // 如果还是没找到，尝试找 journal 链接
      if (!v) {
        v = item.querySelector('a[href*="/journals/"]') || item.querySelector('a[href*="/conf/"]')
      }

      return { title: t ? t.textContent : '', venue: v ? v.textContent : '' }
    }
    function ieeeListItem(item) {
      const t = item.querySelector('a.title') || item.querySelector('h3 a')
      const v = item.querySelector('.publisher') || item.querySelector('.description')
      return { title: t ? t.textContent : '', venue: v ? v.textContent : '' }
    }
    function acmListItem(item) {
      const t = item.querySelector('.search__item h5 a') || item.querySelector('h5 a')
      const v = item.querySelector('.pub__meta') || item.querySelector('.issue-item__detail')
      return { title: t ? t.textContent : '', venue: v ? v.textContent : '' }
    }
    return { common, scholarItem, dblpItem, ieeeListItem, acmListItem }
  })()

  const Renderer = (function () {
    let styled = false
    let statusEl = null
    function ensureStyle() {
      if (styled) return
      addStyle(`
        .ccf-rating{display:inline-block;padding:2px 6px;margin-left:6px;border-radius:4px;font-size:12px;font-weight:600;color:#fff;line-height:1;cursor:help}
        .ccf-a{background-color:#c00}
        .ccf-b{background-color:#f80}
        .ccf-c{background-color:#080}
        .ccf-none{background-color:#7f8c8d}
        
        .sci-q1{background-color:#d32f2f}
        .sci-q2{background-color:#f57c00}
        .sci-q3{background-color:#388e3c}
        .sci-q4{background-color:#1976d2}
        
        .cas-1{background-color:#b71c1c}
        .cas-2{background-color:#e65100}
        .cas-3{background-color:#1b5e20}
        .cas-4{background-color:#0d47a1}

        .ccf-muted{opacity:.8}
        .ccf-container{display:inline-flex;align-items:center}
        .ccf-status{position:fixed;right:10px;bottom:10px;background:rgba(0,0,0,.6);color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;z-index:99999}
      `)
      styled = true
    }

    function inject(node, data, title) {
      const cfg = Config.get()
      if (!cfg.showTag || !node) return
      // 如果没有任何数据且不显示未识别，则返回
      const hasData = data && (data.ccf || data.sci || data.cas)
      if (!hasData && !cfg.showUnrecognized) return

      if (node.dataset && node.dataset.ccfTagged === '1') return
      if (node.querySelector && node.querySelector('.ccf-container')) return

      ensureStyle()

      const container = document.createElement('span')
      container.className = 'ccf-container'

      const createTag = (text, cls, tooltip) => {
        const s = document.createElement('span')
        s.className = `ccf-rating ${cls}`
        s.textContent = text
        s.title = tooltip
        return s
      }

      if (hasData) {
        if (data.ccf) {
          container.appendChild(createTag(`CCF-${data.ccf}`, `ccf-${data.ccf.toLowerCase()}`, `已识别: ${title}`))
        }
        if (data.sci) {
          container.appendChild(createTag(`SCI-${data.sci}`, `sci-${data.sci.toLowerCase()}`, `影响因子: ${data.if || 'N/A'}`))
        }
        if (data.cas) {
          container.appendChild(createTag(`CAS-${data.cas}`, `cas-${data.cas.replace('区', '')}`, `中科院分区: ${data.cas}`))
        }
      } else {
        container.appendChild(createTag('未识别', 'ccf-none ccf-muted', `未识别 (提取名称: ${title})`))
      }

      node.appendChild(container)
      if (node.dataset) node.dataset.ccfTagged = '1'
    }

    function showStatus(text) {
      ensureStyle()
      if (statusEl) { statusEl.textContent = text; return }
      statusEl = document.createElement('div')
      statusEl.className = 'ccf-status'
      statusEl.textContent = text
      document.body.appendChild(statusEl)
    }
    function hideStatus() {
      if (statusEl && statusEl.parentNode) statusEl.parentNode.removeChild(statusEl)
      statusEl = null
    }
    return { inject, showStatus, hideStatus }
  })()

  const Sites = (function () {
    const processed = new WeakSet()
    function log() { if (Config.get().debug) try { console.log.apply(console, arguments) } catch (e) { } }

    function processEntry(item) {
      if (!item || processed.has(item)) return
      const d = Extractor.dblpItem(item)
      const venue = d.venue
      let data = null
      if (venue && venue.trim()) {
        data = DataStore.getRatingByName(venue)
      } else {
        const meta = Extractor.common()
        const byMeta = meta.conference || meta.journal
        if (byMeta) data = DataStore.getRatingByName(byMeta)
      }
      const anchor = item.querySelector('.title') || item.querySelector('.venue')
      Renderer.inject(anchor, data, venue || d.title)
      log('[CCF] dblp item', { title: d.title, venue, data })
      processed.add(item)
    }

    function scholar() {
      const items = document.querySelectorAll('.gs_ri')
      items.forEach(item => {
        const anchor = item.querySelector('.gs_rt')
        if (!anchor || anchor.dataset.ccfTagged === '1') return
        const d = Extractor.scholarItem(item)

        let venueName = ''
        const rawVenue = d.venue || ''

        if (rawVenue.includes(' - ')) {
          const parts = rawVenue.split(' - ')
          if (parts.length >= 2) {
            const candidate = parts[1].trim()
            if (!/^\d{4}$/.test(candidate)) {
              venueName = candidate.split(',')[0].trim()
            }
          }
        }

        const searchName = venueName || rawVenue
        const data = DataStore.getRatingByName(searchName)

        Renderer.inject(anchor, data, searchName)
        if (Config.get().debug) console.log('[CCF] Scholar item:', { title: d.title, raw: rawVenue, extracted: searchName, data })
      })
    }

    function dblp() {
      const items = document.querySelectorAll('.entry')

      const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) processEntry(e.target) })
      }, { root: null, rootMargin: '100px', threshold: 0 }) : null
      items.forEach(item => { if (io) io.observe(item); else processEntry(item) })
      const debouncedAdd = Utils.debounce(() => {
        document.querySelectorAll('.entry').forEach(el => { if (io) io.observe(el); else processEntry(el) })
      }, 100)
      const mo = new MutationObserver(debouncedAdd)
      mo.observe(document.documentElement, { childList: true, subtree: true })
      Utils.idle(() => Renderer.hideStatus())
    }

    function ieee() {
      const meta = Extractor.common()
      const byMeta = meta.conference || meta.journal
      if (byMeta) {
        const header = document.querySelector('h1.document-title') || document.querySelector('h1')
        const data = DataStore.getRatingByName(byMeta)
        Renderer.inject(header, data, byMeta)
        if (Config.get().debug) console.log('[CCF] IEEE meta:', { byMeta, data })
      }
      const list = document.querySelectorAll('.List-results-items, .search-results-list .List-results-items, .search-results .List-results-items')
      list.forEach(item => {
        const anchor = item.querySelector('a.title') || item.querySelector('h3 a')
        if (!anchor || anchor.dataset.ccfTagged === '1') return
        const d = Extractor.ieeeListItem(item)
        const data = DataStore.getRatingByName(d.venue)
        Renderer.inject(anchor, data, d.venue)
        if (Config.get().debug) console.log('[CCF] IEEE item:', { title: d.title, venue: d.venue, data })
      })
    }

    function acm() {
      const meta = Extractor.common()
      const byMeta = meta.conference || meta.journal
      if (byMeta) {
        const header = document.querySelector('.citation__title') || document.querySelector('h1')
        const data = DataStore.getRatingByName(byMeta)
        Renderer.inject(header, data, byMeta)
        if (Config.get().debug) console.log('[CCF] ACM meta:', { byMeta, data })
      }
      const list = document.querySelectorAll('.search__item, .issue-item')
      list.forEach(item => {
        const anchor = item.querySelector('h5 a')
        if (!anchor || anchor.dataset.ccfTagged === '1') return
        const d = Extractor.acmListItem(item)
        const data = DataStore.getRatingByName(d.venue)
        Renderer.inject(anchor, data, d.venue)
        if (Config.get().debug) console.log('[CCF] ACM item:', { title: d.title, venue: d.venue, data })
      })
    }
    return { scholar, dblp, ieee, acm }
  })()

  const Bootstrap = (function () {
    // Utils definitions moved to top level

    const Perf = (function () {
      let enabled = true
      async function time(name, fn) {
        const s = performance.now()
        const r = await fn()
        const e = performance.now()
        if (enabled) console.log(`[CCF] ${name}: ${(e - s).toFixed(2)}ms`)
        return r
      }
      return { time }
    })()
    function route() {
      const u = location.href
      if (u.includes('scholar.google.')) return 'scholar'
      if (u.includes('dblp.org') || u.includes('dblp.uni-trier.de')) return 'dblp'
      if (u.includes('ieeexplore.ieee.org')) return 'ieee'
      if (u.includes('dl.acm.org')) return 'acm'
      return null
    }
    function run() {
      const r = route()
      if (!r) return
      const fn = Sites[r]
      if (typeof fn === 'function') fn()
    }
    function observe() {
      const debounced = Utils.debounce(run, 150)
      const mo = new MutationObserver(debounced)
      mo.observe(document.documentElement, { childList: true, subtree: true })
    }
    async function init() {
      try {
        // Config.menu() // Removed in favor of Popup
        await Config.init();
        await Perf.time('DataStore.init', () => DataStore.init())
        requestAnimationFrame(() => run())
        observe()
      } catch (e) {
        console.error('[CCF] 初始化失败:', e)
      }
    }
    return { init }
  })()

  window.addEventListener('load', () => Bootstrap.init())
})()
